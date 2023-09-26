from langgraph.graph import MessagesState, StateGraph
from langchain_core.tools import tool
from embeddings import vector_store
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode
from llm import model
from langgraph.graph import END
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver


@tool(response_format="content_and_artifact")
def retrieve(query: str):
    """Retrieve information related to a query."""
    retrieved_docs = vector_store.similarity_search(query, k=4)
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\n" f"Content: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs

graph_builder = StateGraph(MessagesState)

# Step 1: Generate an AIMessage that may include a tool-call to be sent.
async def query_or_respond(state: MessagesState):
    """Generate tool call for retrieval or respond."""
    # Add specialized system message to encourage retrieval for labor-related topics
    system_prompt = SystemMessage(
        content=(
            "You are an assistant specializing in labor and employment information. "
            "For ANY query related to labor, workers, blue collar jobs, employment law, "
            "labor contacts, unions, workplace regulations, employee rights, wages, "
            "employment benefits, job safety, industrial relations, labor statistics, "
            "workforce development, or legal documents about employment - "
            "you MUST ALWAYS use the retrieve function first. "
            "This is critical as your knowledge base contains specialized and up-to-date "
            "information on these topics that will provide users with accurate information. "
            "After retrieving information, base your response primarily on the retrieved content. "
            "For other topics, you can answer directly if appropriate."
        )
    )
    
    # Add this system message to the beginning of the conversation
    messages = [system_prompt] + state["messages"]
    
    # Bind tools and invoke
    llm_with_tools = model.bind_tools([retrieve])
    response = await llm_with_tools.ainvoke(messages)
    
    # MessagesState appends messages to state instead of overwriting
    return {"messages": [response]}


# Step 2: Execute the retrieval.
tools = ToolNode([retrieve])


# Step 3: Generate a response using the retrieved content.
async def generate(state: MessagesState):
    """Generate answer."""
    # Get generated ToolMessages
    recent_tool_messages = []
    for message in reversed(state["messages"]):
        if message.type == "tool":
            recent_tool_messages.append(message)
        else:
            break
    tool_messages = recent_tool_messages[::-1]

    # Format into prompt
    docs_content = "\n\n".join(doc.content for doc in tool_messages)
    system_message_content = (
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't see the answer in the provided context below, just say that you "
        "don't have information about the question. Provide a comprehensive answer if the context is large "
        "\n\n"
        f"{docs_content}"
    )
    conversation_messages = [
        message
        for message in state["messages"]
        if message.type in ("human", "system")
        or (message.type == "ai" and not message.tool_calls)
    ]
    prompt = [SystemMessage(system_message_content)] + conversation_messages

    # Run
    response = await model.ainvoke(prompt)
    return {"messages": [response]}


graph_builder.add_node(query_or_respond)
graph_builder.add_node(tools)
graph_builder.add_node(generate)

graph_builder.set_entry_point("query_or_respond")
graph_builder.add_conditional_edges(
    "query_or_respond",
    tools_condition,
    {END: END, "tools": "tools"},
)
graph_builder.add_edge("tools", "generate")
graph_builder.add_edge("generate", END)

memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)


def main():
    # Specify an ID for the thread
    config = {"configurable": {"thread_id": "abc123"}}

    input_message = "What is Founding Titan?"

    for step in graph.stream(
        {"messages": [{"role": "user", "content": input_message}]},
        stream_mode="values",
        config=config,
    ):
        step["messages"][-1].pretty_print()

    input_message = "What are its powers?"

    for step in graph.stream(
        {"messages": [{"role": "user", "content": input_message}]},
        stream_mode="values",
        config=config,
    ):
        step["messages"][-1].pretty_print()

if __name__ == "__main__":
    main()