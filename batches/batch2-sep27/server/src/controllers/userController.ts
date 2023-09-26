import type { Context } from "hono";
import admin from "../firebaseAdmin.js";
import { createRequire } from "module";
import { v4 as uuidv4 } from "uuid";
import type { IncomingMessage } from "http";
import { Readable } from "stream";

const require = createRequire(import.meta.url);
const Busboy = require("busboy");

interface UserProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  profilePhoto?: string; // URL to Firebase Storage
  residentialAddress: string;
  resume?: string; // URL to Firebase Storage
  profession: string;
  gender: string;
  summary?: string;
  createdAt?: FirebaseFirestore.FieldValue;
  updatedAt?: FirebaseFirestore.FieldValue;
}

/**
 * Creates a new user profile.
 * Expects a multipart/form-data request with:
 *  - Text fields: firstName, middleName, lastName, phoneNumber, emailAddress, residentialAddress, profession, gender, summary
 *  - File fields (optional): profilePhoto, resume
 *
 * If a profile for the given user ID already exists, it returns an error.
 */
export const createUserProfileById = async (c: Context): Promise<Response> => {
  return new Promise<Response>(async (resolve) => {
    const contentType: string | undefined = c.req.header("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      resolve(
        c.json({ error: "Content-Type must be multipart/form-data" }, 400)
      );
      return;
    }

    // Get user ID from URL parameter and check if profile exists
    const userId = c.req.param("id");
    if (!userId) {
      resolve(c.json({ error: "User ID not provided" }, 400));
      return;
    }
    const docRef = admin.firestore().collection("userProfiles").doc(userId);
    const existingDoc = await docRef.get();
    if (existingDoc.exists) {
      resolve(c.json({ error: "Profile already exists for this user." }, 400));
      return;
    }

    // Read the entire request body as an ArrayBuffer and convert to Buffer
    const arrayBuffer = await c.req.arrayBuffer();
    const bodyBuffer = Buffer.from(arrayBuffer);

    // Create a Node.js Readable stream from the Buffer
    const nodeReq = Readable.from(bodyBuffer);

    // Create Busboy instance using request headers
    const bb = Busboy({ headers: c.req.header() as Record<string, string> });

    const fields: Record<string, string | undefined | null> = {};

    const files: Record<
      string,
      { buffer: Buffer; filename: string; mimetype: string }
    > = {};
    let fileTypeError: string | null = null;

    bb.on("field", (fieldname: string, val: string) => {
      fields[fieldname] = val;
    });

    bb.on(
      "file",
      (
        fieldname: string,
        file: any,
        filename: any,
        encoding: string,
        mimeType: string
      ) => {
        // Ensure safeFilename is a string
        const safeFilename: string =
          typeof filename?.filename === "string"
            ? filename.filename
            : typeof filename === "string"
            ? filename
            : "unknown_file";

        // Validate resume file
        if (fieldname === "resume") {
          const isValidPDF =
            safeFilename.toLowerCase().endsWith(".pdf") ||
            (mimeType &&
              (mimeType.toLowerCase() === "application/pdf" ||
                mimeType.toLowerCase() === "application/x-pdf" ||
                mimeType.toLowerCase() === "application/acrobat" ||
                mimeType.toLowerCase() === "applications/vnd.pdf" ||
                mimeType.toLowerCase() === "text/pdf" ||
                mimeType.toLowerCase() === "text/x-pdf"));
          if (!isValidPDF) {
            fileTypeError = "Resume must be a PDF file.";
            file.resume();
            return;
          }
        }

        // Validate profilePhoto file
        if (fieldname === "profilePhoto") {
          const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
          const isValidImage =
            (mimeType && validImageTypes.includes(mimeType.toLowerCase())) ||
            /\.(jpg|jpeg|png)$/i.test(safeFilename);
          if (!isValidImage) {
            fileTypeError = "Profile photo must be a JPG or PNG image.";
            file.resume();
            return;
          }
        }

        const chunks: Buffer[] = [];
        file.on("data", (data: Buffer) => {
          chunks.push(data);
        });
        file.on("end", () => {
          files[fieldname] = {
            buffer: Buffer.concat(chunks),
            filename: safeFilename,
            mimetype: mimeType || "",
          };
        });
      }
    );

    bb.on("finish", async () => {
      if (fileTypeError) {
        resolve(c.json({ error: fileTypeError }, 400));
        return;
      }
      try {
        const bucket = admin.storage().bucket();

        // Process profilePhoto if provided
        if (files.profilePhoto) {
          const uniquePhotoName = `${uuidv4()}_${files.profilePhoto.filename}`;
          const photoFileRef = bucket.file(uniquePhotoName);
          await photoFileRef.save(files.profilePhoto.buffer, {
            metadata: { contentType: files.profilePhoto.mimetype },
          });
          await photoFileRef.makePublic();
          fields.profilePhoto = `https://storage.googleapis.com/${bucket.name}/${uniquePhotoName}`;
        }
        // Process resume if provided
        if (files.resume) {
          const uniqueResumeName = `${uuidv4()}_${files.resume.filename}`;
          const resumeFileRef = bucket.file(uniqueResumeName);
          await resumeFileRef.save(files.resume.buffer, {
            metadata: { contentType: files.resume.mimetype },
          });
          await resumeFileRef.makePublic();
          fields.resume = `https://storage.googleapis.com/${bucket.name}/${uniqueResumeName}`;
        }

        // Build the user profile object
        const userProfile: UserProfile = {
          firstName: fields?.firstName || "",
          middleName: fields?.middleName || "",
          lastName: fields?.lastName || "",
          phoneNumber: fields?.phoneNumber || "",
          emailAddress: fields?.emailAddress || "",
          profilePhoto: fields?.profilePhoto || "",
          residentialAddress: fields?.residentialAddress || "",
          resume: fields?.resume || "",
          profession: fields?.profession || "",
          gender: fields?.gender || "",
          summary: fields?.summary || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await docRef.set(userProfile);
        resolve(
          c.json(
            { message: "Profile created successfully", profile: userProfile },
            201
          )
        );
      } catch (error: any) {
        console.error("Error creating profile:", error);
        resolve(
          c.json({ error: error.message || "Error creating profile" }, 500)
        );
      }
    });

    nodeReq.pipe(bb);
  });
};

/**
 * Updates an existing user profile.
 * Expects a multipart/form-data request (with text and/or file fields) to update.
 * Only provided fields will be updated.
 *
 * If new files are uploaded, the previous file (if any) will be deleted from Firebase Storage.
 */
export const updateUserProfileById = async (c: Context): Promise<Response> => {
  return new Promise<Response>(async (resolve) => {
    const contentType: string | undefined = c.req.header("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      resolve(
        c.json({ error: "Content-Type must be multipart/form-data" }, 400)
      );
      return;
    }
    const userId = c.req.param("id");
    if (!userId) {
      resolve(c.json({ error: "User ID not provided" }, 400));
      return;
    }
    const docRef = admin.firestore().collection("userProfiles").doc(userId);
    const existingDoc = await docRef.get();
    const existingProfile = existingDoc.exists ? existingDoc.data() : {};

    const arrayBuffer = await c.req.arrayBuffer();
    const bodyBuffer = Buffer.from(arrayBuffer);
    const nodeReq = Readable.from(bodyBuffer);
    const bb = Busboy({ headers: c.req.header() as Record<string, string> });

    const fields: Record<string, string> = {};
    const files: Record<
      string,
      { buffer: Buffer; filename: string; mimetype: string }
    > = {};
    let fileTypeError: string | null = null;

    bb.on("field", (fieldname: string, val: string) => {
      fields[fieldname] = val;
    });

    bb.on(
      "file",
      (
        fieldname: string,
        file: any,
        filename: any,
        encoding: string,
        mimetype: string
      ) => {
        const safeFilename: string =
          typeof filename?.filename === "string"
            ? filename.filename
            : typeof filename === "string"
            ? filename
            : "unknown_file";

        if (fieldname === "resume") {
          const isValidPDF =
            safeFilename.toLowerCase().endsWith(".pdf") ||
            (mimetype &&
              (mimetype.toLowerCase() === "application/pdf" ||
                mimetype.toLowerCase() === "application/x-pdf" ||
                mimetype.toLowerCase() === "application/acrobat" ||
                mimetype.toLowerCase() === "applications/vnd.pdf" ||
                mimetype.toLowerCase() === "text/pdf" ||
                mimetype.toLowerCase() === "text/x-pdf"));
          if (!isValidPDF) {
            fileTypeError = "Resume must be a PDF file.";
            file.resume();
            return;
          }
        }
        if (fieldname === "profilePhoto") {
          const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
          const isValidImage =
            (mimetype && validImageTypes.includes(mimetype.toLowerCase())) ||
            /\.(jpg|jpeg|png)$/i.test(safeFilename);
          if (!isValidImage) {
            fileTypeError = "Profile photo must be a JPG or PNG image.";
            file.resume();
            return;
          }
        }

        const chunks: Buffer[] = [];
        file.on("data", (data: Buffer) => {
          chunks.push(data);
        });
        file.on("end", () => {
          files[fieldname] = {
            buffer: Buffer.concat(chunks),
            filename: safeFilename,
            mimetype: mimetype || "",
          };
        });
      }
    );

    bb.on("finish", async () => {
      if (fileTypeError) {
        resolve(c.json({ error: fileTypeError }, 400));
        return;
      }
      try {
        const bucket = admin.storage().bucket();

        // If new profilePhoto provided, delete old file if exists
        if (files.profilePhoto && existingProfile?.profilePhoto) {
          const oldPhotoUrl: string = existingProfile.profilePhoto;
          const oldPhotoName = oldPhotoUrl.split("/").pop();
          if (oldPhotoName) {
            try {
              await bucket.file(oldPhotoName).delete();
            } catch (err) {
              console.error("Error deleting old profile photo:", err);
            }
          }
        }
        // If new resume provided, delete old file if exists
        if (files.resume && existingProfile?.resume) {
          const oldResumeUrl: string = existingProfile.resume;
          const oldResumeName = oldResumeUrl.split("/").pop();
          if (oldResumeName) {
            try {
              await bucket.file(oldResumeName).delete();
            } catch (err) {
              console.error("Error deleting old resume:", err);
            }
          }
        }

        // Process new profilePhoto if provided
        if (files.profilePhoto) {
          const uniquePhotoName = `${uuidv4()}_${files.profilePhoto.filename}`;
          const photoFileRef = bucket.file(uniquePhotoName);
          await photoFileRef.save(files.profilePhoto.buffer, {
            metadata: { contentType: files.profilePhoto.mimetype },
          });
          await photoFileRef.makePublic();
          fields.profilePhoto = `https://storage.googleapis.com/${bucket.name}/${uniquePhotoName}`;
        }
        // Process new resume if provided
        if (files.resume) {
          const uniqueResumeName = `${uuidv4()}_${files.resume.filename}`;
          const resumeFileRef = bucket.file(uniqueResumeName);
          await resumeFileRef.save(files.resume.buffer, {
            metadata: { contentType: files.resume.mimetype },
          });
          await resumeFileRef.makePublic();
          fields.resume = `https://storage.googleapis.com/${bucket.name}/${uniqueResumeName}`;
        }

        fields.updatedAt =
          admin.firestore.FieldValue.serverTimestamp() as unknown as string;
        await docRef.update(fields);
        resolve(
          c.json({
            message: "Profile updated successfully",
            updatedFields: fields,
          })
        );
      } catch (error: any) {
        console.error("Error updating profile:", error);
        resolve(
          c.json({ error: error.message || "Error updating profile" }, 500)
        );
      }
    });

    nodeReq.pipe(bb);
  });
};

/**
 * Retrieves the user profile from Firestore.
 * Expects a user ID in the URL parameter.
 */
export const getUserProfileById = async (c: Context): Promise<Response> => {
  try {
    const userId = c.req.param("id");
    if (!userId) {
      return c.json({ error: "User ID not provided" }, 400);
    }
    const docRef = admin.firestore().collection("userProfiles").doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return c.json({ error: "Profile not found" }, 404);
    }
    return c.json(doc.data());
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return c.json({ error: error.message || "Error fetching profile" }, 500);
  }
};

export const getUserRole = async (c: Context): Promise<Response> => {
  try {
    const { userId } = await c.req.json();
    if (!userId) {
      return c.json({ error: "Missing field: userId is required." }, 400);
    }

    // Retrieve user details from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);

    // Get custom claims (where role is stored)
    const role = userRecord.customClaims?.role;

    if (!role) {
      return c.json({ error: "Role not found for this user." }, 404);
    }

    return c.json({ role }, 200);
  } catch (error: any) {
    console.error("Error fetching user role:", error);
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
};