import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCPjpN8Sz9_nV85AoqXGKgUEEucvddHDhE",
  authDomain: "my-dead-projects.firebaseapp.com",
  projectId: "my-dead-projects",
  storageBucket: "my-dead-projects.firebasestorage.app",
  messagingSenderId: "617032081549",
  appId: "1:617032081549:web:be439105dfcd12b23382c4",
  measurementId: "G-ZK0S32PQR5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);
