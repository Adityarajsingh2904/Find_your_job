import type { Community } from "./types"

export const communities: Community[] = [
  {
    id: "electricians",
    name: "Electricians",
    description:
      "A community for professional electricians to share knowledge, ask questions, and find job opportunities.",
    members: 12453,
    moderator: "ElectricPro",
    createdAt: "Jan 2022",
    posts: [
      {
        id: "post1",
        title: "New electrical code changes for 2023",
        content:
          "The National Electrical Code has been updated for 2023. Here are the key changes that will affect our work...",
        author: "ElectricPro",
        timeAgo: "2 hours ago",
        likes: 124,
        dislikes: 5,
        image: "/placeholder.svg?height=400&width=600",
        comments: [
          {
            id: "comment1",
            author: "WireMaster",
            content:
              "Thanks for sharing this! The GFCI requirements are going to be a big change for residential work.",
            timeAgo: "1 hour ago",
            likes: 15,
            dislikes: 0,
            replies: [
              {
                id: "reply1",
                author: "ElectricPro",
                content:
                  "You're right. I've already had to explain this to several clients who were surprised by the additional costs.",
                timeAgo: "45 minutes ago",
                likes: 8,
                dislikes: 0,
              },
            ],
          },
          {
            id: "comment2",
            author: "VoltageVeteran",
            content:
              "Does anyone have a good resource for explaining these changes to customers? I need something simple I can share.",
            timeAgo: "30 minutes ago",
            likes: 7,
            dislikes: 0,
          },
        ],
      },
      {
        id: "post2",
        title: "Job opportunity: Commercial electrician needed in Chicago",
        content:
          "Our company is looking for experienced commercial electricians for a major project starting next month. Competitive pay and benefits.",
        author: "ChicagoElectric",
        timeAgo: "1 day ago",
        likes: 87,
        dislikes: 0,
        comments: [
          {
            id: "comment3",
            author: "MidwestSparky",
            content: "Is this union work? What's the hourly rate?",
            timeAgo: "20 hours ago",
            likes: 12,
            dislikes: 0,
          },
        ],
      },
    ],
  },
  {
    id: "plumbers",
    name: "Plumbers United",
    description: "Connect with fellow plumbers, share tips, and discover job opportunities in the plumbing industry.",
    members: 8765,
    moderator: "PipeMaster",
    createdAt: "Mar 2022",
    posts: [
      {
        id: "post3",
        title: "Best tools for PEX installation?",
        content:
          "I'm looking to upgrade my PEX tools. What are you all using these days? Worth investing in the Milwaukee expansion tool?",
        author: "PipeFitter",
        timeAgo: "5 hours ago",
        likes: 45,
        dislikes: 2,
        comments: [
          {
            id: "comment4",
            author: "PlumbingPro",
            content:
              "I've been using the Milwaukee M12 expansion tool for about a year now. Definitely worth the investment if you do a lot of PEX work.",
            timeAgo: "3 hours ago",
            likes: 18,
            dislikes: 0,
          },
        ],
      },
    ],
  },
  {
    id: "carpenters",
    name: "Carpenters Guild",
    description:
      "A community for carpenters of all skill levels to share projects, techniques, and find work opportunities.",
    members: 10234,
    moderator: "WoodMaster",
    createdAt: "Nov 2021",
    posts: [
      {
        id: "post4",
        title: "Check out this custom cabinet project I just finished",
        content:
          "Just completed this built-in entertainment center for a client. Maple with a natural finish. Really happy with how the hidden wiring channels turned out.",
        author: "FineFinish",
        timeAgo: "1 day ago",
        likes: 210,
        dislikes: 0,
        image: "/placeholder.svg?height=400&width=600",
        comments: [
          {
            id: "comment5",
            author: "WoodWorker",
            content: "Beautiful work! How did you handle the corner joints?",
            timeAgo: "20 hours ago",
            likes: 15,
            dislikes: 0,
          },
        ],
      },
    ],
  },
  {
    id: "hvac",
    name: "HVAC Technicians",
    description: "For HVAC professionals to discuss industry trends, troubleshooting, and career opportunities.",
    members: 7654,
    moderator: "CoolOperator",
    createdAt: "Feb 2022",
    posts: [
      {
        id: "post5",
        title: "R-410A alternatives with the new regulations",
        content:
          "With the phasedown of R-410A, what refrigerants are you all planning to transition to? I'm looking at R-32 systems but concerned about flammability.",
        author: "FreonFreak",
        timeAgo: "3 days ago",
        likes: 89,
        dislikes: 3,
        comments: [
          {
            id: "comment6",
            author: "ACTech",
            content:
              "We've started using R-32 in residential applications. The flammability is a concern but manageable with proper training.",
            timeAgo: "2 days ago",
            likes: 24,
            dislikes: 1,
          },
        ],
      },
    ],
  },
  {
    id: "painters",
    name: "Professional Painters",
    description:
      "A community for painting contractors and professionals to share techniques, product reviews, and business advice.",
    members: 5432,
    moderator: "BrushMaster",
    createdAt: "Apr 2022",
    posts: [
      {
        id: "post6",
        title: "Best exterior paint for harsh weather conditions?",
        content:
          "I have a client with a beach house that takes a beating from salt air and sun. What products are you all having success with in similar conditions?",
        author: "CoastalPainter",
        timeAgo: "4 days ago",
        likes: 67,
        dislikes: 0,
        comments: [
          {
            id: "comment7",
            author: "PaintPro",
            content:
              "Benjamin Moore Aura Exterior has been my go-to for coastal properties. Expensive but worth it for the durability.",
            timeAgo: "3 days ago",
            likes: 19,
            dislikes: 0,
          },
        ],
      },
    ],
  },
]

export const employers = [
  {
    id: "emp1",
    name: "Sarah Johnson",
    company: "BuildRight Construction",
    position: "HR Manager",
    lastMessage: "When can you start the project?",
    time: "10:30 AM",
    unreadCount: 2,
    online: true,
    type: "employer",
  },
  {
    id: "emp2",
    name: "Michael Chen",
    company: "City Electrical Services",
    position: "Project Manager",
    lastMessage: "The job site is ready for inspection",
    time: "Yesterday",
    unreadCount: 0,
    online: true,
    type: "employer",
  },
  {
    id: "emp3",
    name: "Jessica Williams",
    company: "Modern Plumbing Inc.",
    position: "Operations Director",
    lastMessage: "Can you send me your availability for next week?",
    time: "Yesterday",
    unreadCount: 1,
    online: false,
    type: "employer",
  },
  {
    id: "emp4",
    name: "Robert Martinez",
    company: "Elite Carpentry",
    position: "Owner",
    lastMessage: "The client loved your previous work",
    time: "Monday",
    unreadCount: 0,
    online: false,
    type: "employer",
  },
  {
    id: "emp5",
    name: "Amanda Lee",
    company: "Precision HVAC Solutions",
    position: "Hiring Manager",
    lastMessage: "Your references checked out great",
    time: "Last week",
    unreadCount: 0,
    online: true,
    type: "employer",
  },
  {
    id: "emp6",
    name: "David Wilson",
    company: "Wilson Painting & Decorating",
    position: "Owner",
    lastMessage: "I have another job for you if you're interested",
    time: "Last week",
    unreadCount: 0,
    online: false,
    type: "employer",
  },
]

export const messages = [
  {
    id: "msg1",
    sender: "employer",
    content:
      "Hi there! I saw your profile and I'm impressed with your electrical work experience. We have a commercial project starting next month.",
    time: "10:15 AM",
  },
  {
    id: "msg2",
    sender: "user",
    content: "Thanks for reaching out! I'd be interested in learning more about the project.",
    time: "10:18 AM",
  },
  {
    id: "msg3",
    sender: "employer",
    content:
      "Great! It's a complete rewiring of a 3-story office building downtown. The project will last approximately 6 weeks. Are you available during that time?",
    time: "10:20 AM",
  },
  {
    id: "msg4",
    sender: "user",
    content: "Yes, I should be available. What's the pay rate for this project?",
    time: "10:22 AM",
  },
  {
    id: "msg5",
    sender: "employer",
    content:
      "We're offering $38/hour for licensed electricians with commercial experience. We also provide all necessary tools and safety equipment.",
    time: "10:25 AM",
  },
  {
    id: "msg6",
    sender: "employer",
    content:
      "Would you be able to come in for an interview this week? We can discuss the details in person and show you the blueprints.",
    time: "10:26 AM",
  },
  {
    id: "msg7",
    sender: "user",
    content: "That sounds good. I'm available Thursday or Friday afternoon if that works for you.",
    time: "10:28 AM",
  },
  {
    id: "msg8",
    sender: "employer",
    content:
      "Friday at 2 PM would be perfect. Our office is at 123 Main Street, Suite 400. When can you start the project?",
    time: "10:30 AM",
  },
]

