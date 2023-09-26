import type { Context } from 'hono';
import admin from '../firebaseAdmin.js';
import { v4 as uuidv4 } from 'uuid';
import Busboy from 'busboy';
import { Readable } from 'stream';


export const createWorkerCommunity = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      const contentType: string | undefined = c.req.header('content-type');
      if (!contentType || !contentType.includes('multipart/form-data')) {
        resolve(c.json({ error: 'Content-Type must be multipart/form-data' }, 400));
        return;
      }
      console.log(contentType)
  
      // Generate a unique community ID
      const communityId = uuidv4();
      const docRef = admin.firestore().collection('workerCommunities').doc(communityId);
  
      // Read the request body as an ArrayBuffer and convert it to a Buffer
      const arrayBuffer = await c.req.arrayBuffer();
      const bodyBuffer = Buffer.from(arrayBuffer);
      const nodeReq = Readable.from(bodyBuffer);
  
      // Initialize Busboy with the request headers
      const bb = Busboy({ headers: c.req.header() as Record<string, string> });
  
      const fields: Record<string, any> = {};
      const files: Record<string, { buffer: Buffer; filename: string; mimetype: string }> = {};
      let fileTypeError: string | null = null;
  
      // Parse fields; handle array fields for communityRules and communityTopics
      bb.on('field', (fieldname: string, val: string) => {
        if (fieldname === 'communityRules' || fieldname === 'communityTopics') {
          try {
            fields[fieldname] = JSON.parse(val);
          } catch {
            fields[fieldname] = val.split(',').map((item: string) => item.trim());
          }
        } else {
          fields[fieldname] = val;
        }
      });
  
      // Parse files and validate image types for profile and background photos
      bb.on('file', (fieldname: string, file: any, filename: any, encoding: string, mimeType: string) => {
        const safeFilename: string =
          typeof filename?.filename === 'string'
            ? filename.filename
            : typeof filename === 'string'
            ? filename
            : 'unknown_file';
  
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (fieldname === 'communityProfilePhoto' || fieldname === 'communityBackgroundPhoto') {
          const isValidImage =
            (mimeType && validImageTypes.includes(mimeType.toLowerCase())) ||
            /\.(jpg|jpeg|png)$/i.test(safeFilename);
          if (!isValidImage) {
            fileTypeError = `${fieldname} must be a JPG or PNG image`;
            file.resume();
            return;
          }
        }
  
        const chunks: Buffer[] = [];
        file.on('data', (data: Buffer) => {
          chunks.push(data);
        });
        file.on('end', () => {
          files[fieldname] = {
            buffer: Buffer.concat(chunks),
            filename: safeFilename,
            mimetype: mimeType || '',
          };
        });
      });
  
      // Attach an error handler for Busboy
      bb.on('error', (err) => {
        console.error('Busboy error:', err);
        resolve(c.json({ error: err }, 400));
      });
  
      bb.on('finish', async () => {
        if (fileTypeError) {
          resolve(c.json({ error: fileTypeError }, 400));
          return;
        }
  
        // Now that all fields are parsed, check if communityName exists
        if (!fields.communityName) {
          resolve(c.json({ error: 'Community name is required' }, 400));
          return;
        }
        const existingCommunity = await admin.firestore()
          .collection('workerCommunities')
          .where('communityName', '==', fields.communityName)
          .get();
        if (!existingCommunity.empty) {
          resolve(c.json({ error: 'Community name already exists' }, 400));
          return;
        }
  
        try {
          const bucket = admin.storage().bucket();
  
          // Process community profile photo
          if (files.communityProfilePhoto) {
            const uniquePhotoName = `${uuidv4()}_${files.communityProfilePhoto.filename}`;
            const photoFileRef = bucket.file(`community_profiles/${uniquePhotoName}`);
            await photoFileRef.save(files.communityProfilePhoto.buffer, {
              metadata: { contentType: files.communityProfilePhoto.mimetype },
            });
            await photoFileRef.makePublic();
            fields.communityProfilePhoto = `https://storage.googleapis.com/${bucket.name}/community_profiles/${uniquePhotoName}`;
          }
  
          // Process community background photo
          if (files.communityBackgroundPhoto) {
            const uniqueBgName = `${uuidv4()}_${files.communityBackgroundPhoto.filename}`;
            const bgFileRef = bucket.file(`community_backgrounds/${uniqueBgName}`);
            await bgFileRef.save(files.communityBackgroundPhoto.buffer, {
              metadata: { contentType: files.communityBackgroundPhoto.mimetype },
            });
            await bgFileRef.makePublic();
            fields.communityBackgroundPhoto = `https://storage.googleapis.com/${bucket.name}/community_backgrounds/${uniqueBgName}`;
          }
  
          // Validate community type
          const validCommunityTypes = ['public', 'restricted', 'private'];
          if (!validCommunityTypes.includes(fields.communityType)) {
            resolve(c.json({ error: 'Invalid community type. Must be public, restricted, or private' }, 400));
            return;
          }
  
          // Build the community object
          const communityData = {
            communityName: fields.communityName,
            communityDescription: fields.communityDescription,
            communityType: fields.communityType,
            communityTopics: fields.communityTopics || [],
            communityRules: fields.communityRules || [],
            communityProfilePhoto: fields.communityProfilePhoto || null,
            communityBackgroundPhoto: fields.communityBackgroundPhoto || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            memberCount: 0,
            // Optionally, add additional fields like creatorId
          };
  
          await docRef.set(communityData);
          resolve(c.json({ 
            message: 'Community created successfully', 
            communityId: communityId,
            community: communityData 
          }, 201));
        } catch (error: any) {
          console.error('Error creating community:', error);
          resolve(c.json({ error: error.message || 'Error creating community' }, 500));
        }
      });
  
      // Pipe the node stream to Busboy
      nodeReq.pipe(bb);
    });
  };
  

  export const joinWorkerCommunity = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      try {
        // Check Content-Type header for multipart/form-data
        const contentType: string | undefined = c.req.header('content-type');
        if (!contentType || !contentType.includes('multipart/form-data')) {
          resolve(c.json({ error: 'Content-Type must be multipart/form-data' }, 400));
          return;
        }
        
        // Read the request body as an ArrayBuffer, then create a Buffer and Node stream from it
        const arrayBuffer = await c.req.arrayBuffer();
        const bodyBuffer = Buffer.from(arrayBuffer);
        const nodeReq = Readable.from(bodyBuffer);
        
        // Initialize Busboy with request headers
        const bb = Busboy({ headers: c.req.header() as Record<string, string> });
        const fields: Record<string, string> = {};
        
        // Parse fields
        bb.on('field', (fieldname: string, val: string) => {
          fields[fieldname] = val;
        });
        
        // Add an error handler for Busboy
        bb.on('error', (err) => {
          console.error('Busboy error:', err);
          resolve(c.json({ error: err}, 400));
        });
        
        bb.on('finish', async () => {
          // Retrieve required fields from parsed form data
          const { userId, communityId, communityName } = fields;
          if (!userId || !communityId || !communityName) {
            resolve(c.json({ 
              error: 'Missing required fields: userId, communityId, and communityName are required' 
            }, 400));
            return;
          }
          
          // References to Firestore collections
          const communityRef = admin.firestore().collection('workerCommunities').doc(communityId);
          const membershipRef = admin.firestore()
            .collection('communityMemberships')
            .doc(`${communityId}_${userId}`);
    
          // Check if community exists
          const communityDoc = await communityRef.get();
          if (!communityDoc.exists) {
            resolve(c.json({ error: 'Community does not exist' }, 404));
            return;
          }
    
          // Verify community name matches
          const communityData = communityDoc.data();
          if (communityData?.communityName !== communityName) {
            resolve(c.json({ error: 'Community name does not match' }, 400));
            return;
          }
    
          // Check if user is already a member
          const existingMembership = await membershipRef.get();
          if (existingMembership.exists) {
            resolve(c.json({ error: 'User is already a member of this community' }, 400));
            return;
          }
    
          // Create membership data
          const membershipData = {
            userId,
            communityId,
            communityName,
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active' // Optional: track membership status
          };
    
          // Run a Firestore transaction to ensure data consistency
          await admin.firestore().runTransaction(async (transaction) => {
            // Create membership record
            transaction.set(membershipRef, membershipData);
    
            // Increment member count in community
            transaction.update(communityRef, {
              memberCount: admin.firestore.FieldValue.increment(1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          });
    
          resolve(c.json({ 
            message: 'Successfully joined community',
            membership: membershipData 
          }, 201));
        });
        
        // Pipe the node stream into Busboy for processing
        nodeReq.pipe(bb);
        
      } catch (error: any) {
        console.error('Error joining community:', error);
        resolve(c.json({ error: error.message || 'Error joining community' }, 500));
      }
    });
  };

  export const leaveWorkerCommunity = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      try {
        // Check that the request has multipart/form-data content
        const contentType: string | undefined = c.req.header('content-type');
        if (!contentType || !contentType.includes('multipart/form-data')) {
          resolve(c.json({ error: 'Content-Type must be multipart/form-data' }, 400));
          return;
        }
  
        // Read the request body as an ArrayBuffer, then create a Buffer and stream from it
        const arrayBuffer = await c.req.arrayBuffer();
        const bodyBuffer = Buffer.from(arrayBuffer);
        const nodeReq = Readable.from(bodyBuffer);
  
        // Initialize Busboy to parse the multipart form data
        const bb = Busboy({ headers: c.req.header() as Record<string, string> });
        const fields: Record<string, string> = {};
  
        bb.on('field', (fieldname: string, val: string) => {
          fields[fieldname] = val;
        });
  
        // Attach error handler for Busboy
        bb.on('error', (err) => {
          console.error('Busboy error:', err);
          resolve(c.json({ error: err }, 400));
        });
  
        bb.on('finish', async () => {
          // Extract required fields from the parsed form data
          const { userId, communityId, communityName } = fields;
          if (!userId || !communityId || !communityName) {
            resolve(
              c.json(
                { error: 'Missing required fields: userId, communityId, and communityName are required' },
                400
              )
            );
            return;
          }
  
          // References to Firestore collections
          const membershipRef = admin
            .firestore()
            .collection('communityMemberships')
            .doc(`${communityId}_${userId}`);
          const communityRef = admin.firestore().collection('workerCommunities').doc(communityId);
  
          // Retrieve the membership document
          const membershipDoc = await membershipRef.get();
          if (!membershipDoc.exists) {
            resolve(c.json({ error: 'Membership not found' }, 404));
            return;
          }
  
          // Optionally verify that the community name matches (if desired)
          const communityDoc = await communityRef.get();
          if (!communityDoc.exists) {
            resolve(c.json({ error: 'Community does not exist' }, 404));
            return;
          }
          if (communityDoc.data()?.communityName !== communityName) {
            resolve(c.json({ error: 'Community name does not match' }, 400));
            return;
          }
  
          // Run a Firestore transaction to delete the membership document and decrement member count
          await admin.firestore().runTransaction(async (transaction) => {
            // Delete the membership document
            transaction.delete(membershipRef);
  
            // Decrement member count in community
            transaction.update(communityRef, {
              memberCount: admin.firestore.FieldValue.increment(-1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          });
  
          resolve(
            c.json(
              { message: 'Successfully left community (membership removed)' },
              200
            )
          );
        });
  
        // Pipe the node stream into Busboy for processing
        nodeReq.pipe(bb);
      } catch (error: any) {
        console.error('Error leaving community:', error);
        resolve(c.json({ error: error.message || 'Error leaving community' }, 500));
      }
    });
  };
  
  
  

  export const getCommunityById = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      try {
        // Get community ID from URL parameter
        const communityId = c.req.param('id');
        
        if (!communityId) {
          resolve(c.json({ error: 'Community ID is required' }, 400));
          return;
        }
  
        // Reference to the community document
        const communityRef = admin.firestore()
          .collection('workerCommunities')
          .doc(communityId);
  
        // Get community data
        const communityDoc = await communityRef.get();
  
        if (!communityDoc.exists) {
          resolve(c.json({ error: 'Community not found' }, 404));
          return;
        }
  
        // Get the community data
        const communityData = communityDoc.data();
  
        // Optionally, get membership count (alternative to stored memberCount)
        const membershipsSnapshot = await admin.firestore()
          .collection('communityMemberships')
          .where('communityId', '==', communityId)
          .count()
          .get();
  
        // Prepare response data
        const responseData = {
          communityId: communityDoc.id,
          ...communityData,
          memberCount: communityData?.memberCount || membershipsSnapshot.data().count,
        };
  
        resolve(c.json({ 
          message: 'Community retrieved successfully',
          community: responseData 
        }, 200));
  
      } catch (error: any) {
        console.error('Error retrieving community:', error);
        resolve(c.json({ 
          error: error.message || 'Error retrieving community' 
        }, 500));
      }
    });
  };

  export const getUserCommunities = async (c: Context): Promise<Response> => {
    try {
      // Extract userId from URL parameters
      const userId = c.req.param("userId");
      if (!userId) {
        return c.json({ error: "UserId is required" }, 400);
      }
  
      // Query membership records for the given userId
      const membershipQuery = await admin
        .firestore()
        .collection("communityMemberships")
        .where("userId", "==", userId)
        .get();
  
      if (membershipQuery.empty) {
        return c.json({ communities: [] }, 200);
      }
  
      // For each membership, fetch the corresponding community data
      const communityPromises = membershipQuery.docs.map(async (membershipDoc) => {
        const membershipData = membershipDoc.data();
        const communityDoc = await admin
          .firestore()
          .collection("workerCommunities")
          .doc(membershipData.communityId)
          .get();
  
        // If the community document exists, combine its data with membership details
        if (communityDoc.exists) {
          return {
            communityId: communityDoc.id,
            ...communityDoc.data(),
            joinedAt: membershipData.joinedAt,
          };
        }
        // Fallback if community data is missing for some reason
        return {
          communityId: membershipData.communityId,
          joinedAt: membershipData.joinedAt,
        };
      });
  
      const communities = await Promise.all(communityPromises);
      return c.json({ communities }, 200);
    } catch (error: any) {
      console.error("Error getting user communities:", error);
      return c.json({ error: error.message || "Error getting user communities" }, 500);
    }
  };
  

  export const searchCommunityByName = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      try {
        // Get community name from query parameter
        const communityName = c.req.query('name');
  
        if (!communityName) {
          resolve(c.json({ error: 'Community name is required as a query parameter' }, 400));
          return;
        }
  
        // Optional: Get limit parameter for pagination (default to 10)
        const limit = parseInt(c.req.query('limit') || '10', 10);
        if (isNaN(limit) || limit < 1 || limit > 100) {
          resolve(c.json({ error: 'Limit must be a number between 1 and 100' }, 400));
          return;
        }
  
        // Search communities with case-insensitive partial matching
        const searchTerm = communityName.toLowerCase();
        const communitiesRef = admin.firestore().collection('workerCommunities');
  
        const querySnapshot = await communitiesRef
          .where('communityNameLower', '>=', searchTerm)
          .where('communityNameLower', '<=', searchTerm + '\uf8ff')
          .limit(limit)
          .get();
  
        let results: CommunitySearchResult[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as CommunitySearchResult; // Type assertion
          return {
            communityId: doc.id,
            communityName: data.communityName,
            communityDescription: data.communityDescription,
            communityType: data.communityType,
            communityTopics: data.communityTopics,
            communityRules: data.communityRules,
            communityProfilePhoto: data.communityProfilePhoto,
            communityBackgroundPhoto: data.communityBackgroundPhoto,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            memberCount: data.memberCount
          };
        });
  
        if (results.length === 0) {
          const allCommunities = await communitiesRef.limit(limit).get();
          results = allCommunities.docs
            .map(doc => {
              const data = doc.data() as CommunitySearchResult;
              return {
                communityId: doc.id,
                communityName: data.communityName,
                communityDescription: data.communityDescription,
                communityType: data.communityType,
                communityTopics: data.communityTopics,
                communityRules: data.communityRules,
                communityProfilePhoto: data.communityProfilePhoto,
                communityBackgroundPhoto: data.communityBackgroundPhoto,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                memberCount: data.memberCount
              };
            })
            .filter(community => 
              community.communityName.toLowerCase().includes(searchTerm)
            )
            .slice(0, limit);
        }
  
        resolve(c.json({
          message: 'Community search completed',
          results: results,
          count: results.length
        }, 200));
  
      } catch (error: any) {
        console.error('Error searching communities:', error);
        resolve(c.json({ 
          error: error.message || 'Error searching communities' 
        }, 500));
      }
    });
  };
  
  export const getAllCommunities = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      try {
        // Get optional cursor for pagination from query parameter
        const cursor = c.req.query('cursor'); // This will be the last communityId from previous page
  
        // Fixed limit of 20 communities per response
        const LIMIT = 20;
  
        const communitiesRef = admin.firestore().collection('workerCommunities');
  
        // Build the query
        let query = communitiesRef
          .orderBy('createdAt', 'desc') // Ordering by creation date, newest first
          .limit(LIMIT);
  
        // If cursor is provided, start after that document
        if (cursor) {
          const lastDoc = await communitiesRef.doc(cursor).get();
          if (!lastDoc.exists) {
            resolve(c.json({ error: 'Invalid cursor provided' }, 400));
            return;
          }
          query = query.startAfter(lastDoc);
        }
  
        // Execute the query
        const querySnapshot = await query.get();
  
        // Map the results
        const communities: CommunitySummary[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as CommunitySummary;
          return {
            communityId: doc.id,
            communityName: data.communityName,
            communityDescription: data.communityDescription,
            communityType: data.communityType,
            communityTopics: data.communityTopics,
            communityRules: data.communityRules,
            communityProfilePhoto: data.communityProfilePhoto,
            communityBackgroundPhoto: data.communityBackgroundPhoto,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            memberCount: data.memberCount
          };
        });
  
        // Get the last document's ID for the next cursor
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        const nextCursor = lastDoc ? lastDoc.id : null;
  
        resolve(c.json({
          message: 'Communities retrieved successfully',
          communities,
          count: communities.length,
          nextCursor, // Client can use this for the next page
          hasMore: communities.length === LIMIT // Indicates if there might be more pages
        }, 200));
  
      } catch (error: any) {
        console.error('Error retrieving communities:', error);
        resolve(c.json({ 
          error: error.message || 'Error retrieving communities' 
        }, 500));
      }
    });
  };

  export const createCommunityPost = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      const contentType: string | undefined = c.req.header('content-type');
      if (!contentType || !contentType.includes('multipart/form-data')) {
        resolve(c.json({ error: 'Content-Type must be multipart/form-data' }, 400));
        return;
      }
  
      // Generate unique post ID
      const postId = uuidv4();
      const postsRef = admin.firestore().collection('communityPosts').doc(postId);
  
      // Read request body
      const arrayBuffer = await c.req.arrayBuffer();
      const bodyBuffer = Buffer.from(arrayBuffer);
      const nodeReq = Readable.from(bodyBuffer);
  
      const bb = Busboy({ headers: c.req.header() as Record<string, string> });
  
      const fields: Record<string, any> = {};
      const files: Record<string, { buffer: Buffer; filename: string; mimetype: string }> = {};
      let fileTypeError: string | null = null;
  
      bb.on('field', (fieldname: string, val: string) => {
        fields[fieldname] = val;
      });
  
      bb.on('file', (fieldname: string, file: any, filename: any, encoding: string, mimeType: string) => {
        const safeFilename: string =
          typeof filename?.filename === 'string'
            ? filename.filename
            : typeof filename === 'string'
            ? filename
            : 'unknown_file';
  
        // Validate image file (optional)
        if (fieldname === 'image') {
          const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
          const isValidImage =
            (mimeType && validImageTypes.includes(mimeType.toLowerCase())) ||
            /\.(jpg|jpeg|png)$/i.test(safeFilename);
          if (!isValidImage) {
            fileTypeError = 'Image must be a JPG or PNG file';
            file.resume();
            return;
          }
        }
  
        const chunks: Buffer[] = [];
        file.on('data', (data: Buffer) => {
          chunks.push(data);
        });
        file.on('end', () => {
          files[fieldname] = {
            buffer: Buffer.concat(chunks),
            filename: safeFilename,
            mimetype: mimeType || '',
          };
        });
      });
  
      bb.on('finish', async () => {
        if (fileTypeError) {
          resolve(c.json({ error: fileTypeError }, 400));
          return;
        }
  
        try {
          // Validate required fields
          const { communityId, title, content, author,displayAuthor } = fields;
          if (!communityId || !title || !content || !author || !displayAuthor) {
            resolve(c.json({ 
              error: 'Missing required fields: communityId, title, content, and author are required' 
            }, 400));
            return;
          }
  
          // Check if community exists
          const communityRef = admin.firestore().collection('workerCommunities').doc(communityId);
          const communityDoc = await communityRef.get();
          if (!communityDoc.exists) {
            resolve(c.json({ error: 'Community does not exist' }, 404));
            return;
          }
  
          // Check if author is a member (assuming userId is same as author for simplicity)
          const membershipRef = admin.firestore()
            .collection('communityMemberships')
            .doc(`${communityId}_${author}`);
          const membershipDoc = await membershipRef.get();
          if (!membershipDoc.exists) {
            resolve(c.json({ error: 'User is not a member of this community' }, 403));
            return;
          }
  
          const bucket = admin.storage().bucket();
          let imageUrl: string|null=null
  
          // Process image if provided
          if (files.image) {
            const uniqueImageName = `${uuidv4()}_${files.image.filename}`;
            const imageFileRef = bucket.file(`post_images/${uniqueImageName}`);
            await imageFileRef.save(files.image.buffer, {
              metadata: { contentType: files.image.mimetype },
            });
            await imageFileRef.makePublic();
            imageUrl = `https://storage.googleapis.com/${bucket.name}/post_images/${uniqueImageName}`;
          }
  
          // Create post data
          const postData: CommunityPost = {
            communityId:communityId,
            id: postId,
            title:title,
            content:content || "",
            author:displayAuthor || "anonymous",
            timeAgo: 'just now',
            likes: 0,
            dislikes: 0,
            image: imageUrl||"",
            comments: [], 
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
  
          // Save post
          await postsRef.set(postData);
  
          // Update community with last activity
          await communityRef.update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
  
          resolve(c.json({
            message: 'Post created successfully',
            post: postData
          }, 201));
  
        } catch (error: any) {
          console.error('Error creating post:', error);
          resolve(c.json({ 
            error: error.message || 'Error creating post' 
          }, 500));
        }
      });
  
      nodeReq.pipe(bb);
    });
  };

  //get communityPosts

export const getCommunityPosts = async (c: Context): Promise<Response> => {
  return new Promise<Response>(async (resolve) => {
    try {
      // Get community ID from query parameter
      const communityId = c.req.query('communityId');

      if (!communityId) {
        resolve(c.json({ error: 'communityId is required as a query parameter' }, 400));
        return;
      }

      // Check if community exists
      const communityRef = admin.firestore().collection('workerCommunities').doc(communityId);
      const communityDoc = await communityRef.get();
      if (!communityDoc.exists) {
        resolve(c.json({ error: 'Community not found' }, 404));
        return;
      }

      // Optional: Pagination parameters (default to 20 posts)
      const limit = parseInt(c.req.query('limit') || '20', 10);
      const cursor = c.req.query('cursor'); // Last post ID from previous page

      if (isNaN(limit) || limit < 1 || limit > 100) {
        resolve(c.json({ error: 'Limit must be a number between 1 and 100' }, 400));
        return;
      }

      // Query posts
      let postsQuery = admin.firestore()
        .collection('communityPosts')
        .where('communityId', '==', communityId)
        .orderBy('createdAt', 'desc') // Newest first
        .limit(limit);

      if (cursor) {
        const lastDoc = await admin.firestore().collection('communityPosts').doc(cursor).get();
        if (!lastDoc.exists) {
          resolve(c.json({ error: 'Invalid cursor provided' }, 400));
          return;
        }
        postsQuery = postsQuery.startAfter(lastDoc);
      }

      const postsSnapshot = await postsQuery.get();

      // Map posts to response format
      const posts: CommunityPost[] = postsSnapshot.docs.map(doc => {
        const data = doc.data() as CommunityPost;
        return {
          communityId: data.communityId,
          id: doc.id,
          title: data.title,
          content: data.content,
          author: data.author,
          timeAgo: data.timeAgo, // Client should recalculate this
          likes: data.likes,
          dislikes: data.dislikes,
          image: data.image,
          comments: data.comments || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });

      // Get next cursor for pagination
      const lastDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      const nextCursor = lastDoc ? lastDoc.id : null;

      resolve(c.json({
        message: 'Posts retrieved successfully',
        posts,
        count: posts.length,
        nextCursor,
        hasMore: posts.length === limit
      }, 200));

    } catch (error: any) {
      console.error('Error retrieving community posts:', error);
      resolve(c.json({ 
        error: error.message || 'Error retrieving community posts' 
      }, 500));
    }
  });
};

export const getUserJoinedCommunityPosts = async (c: Context): Promise<Response> => {
    return new Promise<Response>(async (resolve) => {
      try {
        // Get userId from query parameters
        const userId = c.req.query('userId');
        if (!userId) {
          resolve(c.json({ error: 'userId query parameter is required' }, 400));
          return;
        }
  
        // Query the communityMemberships collection for memberships of this user
        const membershipSnapshot = await admin.firestore()
          .collection('communityMemberships')
          .where('userId', '==', userId)
          .get();
  
        if (membershipSnapshot.empty) {
          resolve(c.json({ message: 'User has not joined any communities', communities: [] }, 200));
          return;
        }
  
        // Limit to a maximum of 5 communities
        const membershipDocs = membershipSnapshot.docs.slice(0, 5);
  
        // For each membership, query up to 5 community posts (latest first)
        const communitiesWithPosts = await Promise.all(
          membershipDocs.map(async (membershipDoc) => {
            const membershipData = membershipDoc.data();
            const communityId = membershipData.communityId;
  
            const postsSnapshot = await admin.firestore()
              .collection('communityPosts')
              .where('communityId', '==', communityId)
              .orderBy('createdAt', 'desc')
              .limit(5)
              .get();
  
            const posts = postsSnapshot.docs.map((postDoc) => {
              const data = postDoc.data();
              return {
                id: postDoc.id,
                ...data,
              };
            });
  
            return {
              communityId,
              posts,
            };
          })
        );
  
        resolve(
          c.json(
            {
              message: 'Community posts retrieved successfully',
              communities: communitiesWithPosts,
            },
            200
          )
        );
      } catch (error: any) {
        console.error('Error retrieving user joined community posts:', error);
        resolve(
          c.json({ error: error.message || 'Error retrieving user joined community posts' }, 500)
        );
      }
    });
  };

export const addCommentToPost = async (c: Context): Promise<Response> => {
  return new Promise<Response>(async (resolve) => {
    try {
      // Ensure the Content-Type is application/json
      const contentType = c.req.header('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        resolve(c.json({ error: 'Content-Type must be application/json' }, 400));
        return;
      }
      
      // Parse the JSON body
      const body = await c.req.json();
      const { userId, postId, content } = body;
      
      if (!userId || !postId || content === undefined) {
        resolve(c.json({ error: 'userId, postId and content are required' }, 400));
        return;
      }
      
      // Reference the post document
      const postRef = admin.firestore().collection('communityPosts').doc(postId);
      const postDoc = await postRef.get();
      
      if (!postDoc.exists) {
        resolve(c.json({ error: 'Post not found' }, 404));
        return;
      }
      
      // Create the new comment object following the Comment interface
      const newComment: Comment = {
        id: uuidv4(),
        author: userId,
        content: content,
        timeAgo: "just now",
        likes: 0,
        dislikes: 0,
      };
      
      // Update the post document: add the new comment to the comments array and update the timestamp
      await postRef.update({
        comments: admin.firestore.FieldValue.arrayUnion(newComment),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      resolve(c.json({ message: 'Comment added successfully' }, 200));
      
    } catch (error: any) {
      console.error('Error adding comment:', error);
      resolve(c.json({ error: error.message || 'Error adding comment' }, 500));
    }
  });
};

export const getCommunityPost = async (c: Context): Promise<Response> => {
  return new Promise<Response>(async (resolve) => {
    try {
      // Get postId from query parameter
      const postId = c.req.query('postId');

      if (!postId) {
        resolve(c.json({ error: 'postId is required as a query parameter' }, 400));
        return;
      }

      // Reference the post document
      const postRef = admin.firestore().collection('communityPosts').doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        resolve(c.json({ error: 'Post not found' }, 404));
        return;
      }

      // Map the post data
      const data = postDoc.data() as CommunityPost;
      const post: CommunityPost = {
        communityId: data.communityId,
        id: postDoc.id,
        title: data.title,
        content: data.content,
        author: data.author,
        timeAgo: data.timeAgo,
        likes: data.likes,
        dislikes: data.dislikes,
        image: data.image,
        comments: data.comments || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      resolve(c.json({
        message: 'Post retrieved successfully',
        post,
      }, 200));
    } catch (error: any) {
      console.error('Error retrieving post:', error);
      resolve(c.json({ error: error.message || 'Error retrieving post' }, 500));
    }
  });
};


  
  
  // Interfaces
  interface CommunityPost {
    communityId: string;
    id: string;
    title: string;
    content: string;
    author: string;
    timeAgo: string;
    likes: number;
    dislikes: number;
    image: string | null;
    comments: Comment[];
    createdAt: any;
    updatedAt: any;
  }
  
  interface Comment {
    id: string;
    author: string;
    content: string;
    timeAgo: string;
    likes: number;
    dislikes: number;
  }

  interface CommunitySummary {
    communityId: string;
    communityName: string;
    communityDescription: string;
    communityType: 'public' | 'restricted' | 'private';
    communityTopics: string[];
    communityRules: string[];
    communityProfilePhoto: string | null;
    communityBackgroundPhoto: string | null;
    createdAt: any;
    updatedAt: any;
    memberCount: number;
  }
  
  // Interface definition
  interface CommunitySearchResult {
    communityId: string;
    communityName: string;
    communityDescription: string;
    communityType: 'public' | 'restricted' | 'private';
    communityTopics: string[];
    communityRules: string[];
    communityProfilePhoto: string | null;
    communityBackgroundPhoto: string | null;
    createdAt: any;
    updatedAt: any;
    memberCount: number;
  }

interface CommunityMembership {
    userId: string;
    communityId: string;
    communityName: string;
    joinedAt: any;
    status: string;
  }
interface WorkerCommunity {
  communityName: string;
  communityDescription: string;
  communityType: 'public' | 'restricted' | 'private';
  communityTopics: string[];
  communityRules: string[];
  communityProfilePhoto: string | null;
  communityBackgroundPhoto: string | null;
  createdAt: any;
  updatedAt: any;
  memberCount: number;
}