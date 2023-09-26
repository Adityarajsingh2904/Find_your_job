import type { Context } from 'hono';
import admin from '../firebaseAdmin.js';
import { v4 as uuidv4 } from 'uuid';
import Busboy from 'busboy';
import { Readable } from 'stream';



export const createJobPost = async (c: Context): Promise<Response> => {
  return new Promise<Response>(async (resolve) => {
    // Check for multipart/form-data content type
    const contentType: string | undefined = c.req.header('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      resolve(c.json({ error: 'Content-Type must be multipart/form-data' }, 400));
      return;
    }

    // Generate unique job post ID and Firestore document reference
    const jobPostId = uuidv4();
    const jobPostsRef = admin.firestore().collection('jobPosts').doc(jobPostId);

    // Read the request body into a buffer and create a stream
    const arrayBuffer = await c.req.arrayBuffer();
    const bodyBuffer = Buffer.from(arrayBuffer);
    const nodeReq = Readable.from(bodyBuffer);

    // Set up Busboy to parse multipart/form-data
    const bb = Busboy({ headers: c.req.header() as Record<string, string> });
    const fields: Record<string, any> = {};

    bb.on('field', (fieldname: string, val: string) => {
      fields[fieldname] = val;
    });

    bb.on('finish', async () => {
      try {
        // Only these fields are required:
        const { employer_id, job_title, type_of_work } = fields;
        if (!employer_id || !job_title || !type_of_work) {
          resolve(
            c.json(
              { error: 'Missing required fields: employer_id, job_title, and type_of_work are required' },
              400
            )
          );
          return;
        }

        // Optional fields with defaults if not provided
        const employer_name = fields.employer_name || '';
        const place_of_work = fields.place_of_work || '';
        const city = fields.city || '';
        const state = fields.state || '';
        const district = fields.district || '';
        const pincode = fields.pincode || '';
        const vacancies = fields.vacancies ? Number(fields.vacancies) : 0;
        const special_woman_provision = fields.special_woman_provision === 'true';
        const special_transgender_provision = fields.special_transgender_provision === 'true';
        const special_disability_provision = fields.special_disability_provision === 'true';
        const wage = fields.wage || '';
        const hours_per_week = fields.hours_per_week ? Number(fields.hours_per_week) : 0;
        const job_duration = fields.job_duration || '';
        const start_time = fields.start_time || '';
        const end_time = fields.end_time || '';
        const job_role_description = fields.job_role_description || '';

        // Construct the job post data object
        const jobPostData = {
          id: jobPostId,
          employer_id,
          employer_name,
          job_title,
          place_of_work,
          location: {
            city,
            state,
            district,
            pincode
          },
          vacancies,
          special_woman_provision,
          special_transgender_provision,
          special_disability_provision,
          wage,
          hours_per_week,
          job_duration,
          start_time,
          end_time,
          type_of_work,
          job_role_description,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Save the job post to Firestore
        await jobPostsRef.set(jobPostData);

        resolve(
          c.json(
            {
              message: 'Job post created successfully',
              jobPost: jobPostData
            },
            201
          )
        );
      } catch (error: any) {
        console.error('Error creating job post:', error);
        resolve(c.json({ error: error.message || 'Error creating job post' }, 500));
      }
    });

    // Pipe the request to Busboy for processing
    nodeReq.pipe(bb);
  });
};

export const fetchJobPosts = async (c: Context): Promise<Response> => {
  try {
    // Retrieve query parameters using the query() method
    const employer_id = c.req.query('employer_id');
    const type_of_work = c.req.query('type_of_work');
    const limitStr = c.req.query('limit');

    // Start with a base query on the "jobPosts" collection
    let query: FirebaseFirestore.Query = admin.firestore().collection('jobPosts');

    // Filter by employer_id if provided
    if (employer_id) {
      query = query.where('employer_id', '==', employer_id);
    }

    // Filter by type_of_work if provided
    if (type_of_work) {
      query = query.where('type_of_work', '==', type_of_work);
    }

    // Apply limit if provided and valid
    if (limitStr) {
      const limitNumber = Number(limitStr);
      if (!isNaN(limitNumber)) {
        query = query.limit(limitNumber);
      }
    }

    // Execute the query and collect results
    const snapshot = await query.get();
    const jobPosts: any[] = [];
    snapshot.forEach((doc) => {
      jobPosts.push(doc.data());
    });

    return c.json({ jobPosts }, 200);
  } catch (error: any) {
    console.error('Error fetching job posts:', error);
    return c.json({ error: error.message || 'Error fetching job posts' }, 500);
  }
};

export const fetchJobPostById = async (c: Context): Promise<Response> => {
  try {
    // Retrieve the job post ID from the route parameters
    const jobPostId = c.req.param('jobId');
    if (!jobPostId) {
      return c.json({ error: "Job post id is required" }, 400);
    }

    // Get a reference to the specific job post document
    const docRef = admin.firestore().collection('jobPosts').doc(jobPostId);
    const docSnapshot = await docRef.get();

    // Check if the document exists
    if (!docSnapshot.exists) {
      return c.json({ error: "Job post not found" }, 404);
    }

    // Return the job post data
    return c.json({ jobPost: docSnapshot.data() }, 200);
  } catch (error: any) {
    console.error('Error fetching job post:', error);
    return c.json({ error: error.message || 'Error fetching job post' }, 500);
  }
};

export interface JobPost {
  id: string;
  employer_id: string;
  job_title: string;
  type_of_work: string;
  employer_name?: string;
  place_of_work?: string;
  location?: {
    city?: string;
    state?: string;
    district?: string;
    pincode?: string;
  };
  vacancies?: number;
  special_woman_provision?: boolean;
  special_transgender_provision?: boolean;
  special_disability_provision?: boolean;
  wage?: string;
  hours_per_week?: number;
  job_duration?: string;
  start_time?: string;
  end_time?: string;
  job_role_description?: string;
  createdAt?: FirebaseFirestore.FieldValue;
  updatedAt?: FirebaseFirestore.FieldValue;
}

  
  