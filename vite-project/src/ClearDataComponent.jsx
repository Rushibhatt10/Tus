import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";

import fs from 'fs';
import path from 'path';

// Using the config from src/firebase.jsx to connect
// It seems the config uses vite env variables, so let's import the file directly or mock it
// Actually, since it's a node script, we can't easily use import.meta.env
// Let's create a script that runs IN the browser via a temporary component
