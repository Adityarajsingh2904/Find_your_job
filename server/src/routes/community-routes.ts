import { Hono } from 'hono' 
import { authMiddleware,workerMiddleware } from '../middlewares/authMiddleware.js'
import { addCommentToPost, createCommunityPost, createWorkerCommunity, getAllCommunities, getCommunityById, getCommunityPost, getCommunityPosts, getUserCommunities, getUserJoinedCommunityPosts, joinWorkerCommunity, leaveWorkerCommunity, searchCommunityByName } from '../controllers/communitiesController.js'
const communityRoutes = new Hono()


//all community routes
communityRoutes.use('*', authMiddleware)
communityRoutes.post("/create-community", createWorkerCommunity)
communityRoutes.post("/join", joinWorkerCommunity)
communityRoutes.post("/leave",leaveWorkerCommunity)
communityRoutes.get("/joined/:userId", getUserCommunities)
communityRoutes.get("/search", searchCommunityByName)
communityRoutes.get("/all", getAllCommunities)
communityRoutes.post("/posts",createCommunityPost)
communityRoutes.get("/posts",getCommunityPosts)
communityRoutes.post("/add-comment",addCommentToPost)
communityRoutes.get("/get-post",getCommunityPost)
communityRoutes.get('/joined-posts', getUserJoinedCommunityPosts);
communityRoutes.get("/:id", getCommunityById)

//branch main



export default communityRoutes
