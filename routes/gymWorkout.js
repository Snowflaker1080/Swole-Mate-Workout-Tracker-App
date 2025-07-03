// ECMAScript Modules (ESM) syntax
// Imports
import express from "express";
import {
    index,
    imageProxy,
    newForm,
    create,
    editForm,
    update,
} from "../controllers/gymWorkout.js";

import isSignedIn from "../middleware/is-signed-in.js";

const router = express.Router();

// Public route
router.get("/", index); // Exercise search visible to all

// Protected routes
router.get("/new",isSignedIn, newForm); 
router.post("/", isSignedIn, create); 
router.get("/:id/edit", isSignedIn, editForm); 
router.post("/:id",isSignedIn, update); 

// Proxy image fetch
router.get("/image-proxy", imageProxy);

export default router;