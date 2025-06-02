// firebaseUtils.ts
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";

import {
  setDoc,
  doc,
  Timestamp,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  serverTimestamp,
  addDoc,
  getFirestore,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { User, Photo, SignUpForm } from "../types/schema";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

const FIREBASE_AUTH_ERRORS = {
  "auth/invalid-credential": "Virheellinen sähköposti tai salasana.",
  "auth/user-disabled": "Tämä tili on poistettu käytöstä.",
  "auth/too-many-requests":
    "Liian monta epäonnistunutta yritystä. Yritä myöhemmin uudelleen.",
  "auth/network-request-failed": "Verkkovirhe. Tarkista internetyhteytesi.",
  "auth/invalid-email": "Virheellinen sähköpostiosoite.",
} as const;

/**
 * Creates a new user account with Firebase Authentication
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to Firebase UserCredential
 */
export const createAuthUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Sends a verification email to the newly created user
 *
 * @param userCredential - Firebase UserCredential from createAuthUser
 * @returns Promise resolving when email is sent
 */
export const sendVerificationEmail = async (
  userCredential: UserCredential
): Promise<void> => {
  try {
    await sendEmailVerification(userCredential.user);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Non-critical error, doesn't throw
  }
};

/**
 * Creates or updates a user profile in Firestore
 *
 * @param userData - User data to be stored in Firestore
 * @returns Promise resolving when the operation completes
 */
export const updateUserWithData = async (userData: User): Promise<void> => {
  if (!userData?.uid) {
    throw new Error("User ID is required for database operations");
  }

  try {
    const userRef = doc(db, "Profiles", userData.uid);
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error(`Error updating user ${userData.uid}:`, error);
    throw error;
  }
};

/**
 * Sets a session cookie in the browser
 *
 * @param userCredential - Firebase UserCredential from which to get token
 * @returns Promise resolving when cookie is set
 */
export const setSessionCookie = async (
  userCredential: UserCredential
): Promise<void> => {
  const token = await userCredential.user.getIdToken();
  document.cookie = `session=${token}; path=/; max-age=604800; secure; samesite=strict`;
};

/**
 * Creates a complete user profile object from authentication and form data
 *
 * @param userCredential - Firebase UserCredential containing auth user data
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Complete User object ready for database storage
 */
export const createUserProfile = async (
  userCredential: UserCredential,
  firstName: string,
  lastName: string,
  age: number
): Promise<User> => {
  return {
    uid: userCredential.user.uid,
    displayName: `${firstName} ${lastName}`,
    email: userCredential.user.email || "",
    birthDate: new Date(), // Placeholder
    gender: "", // Placeholder
    guild: "", // Placeholder
    age: age,
    interests: [], // Placeholder
    photos: [], // Placeholder
    bio: "", // Placeholder
    lastActive: Timestamp.now(),
    isActive: false,
  };
};

/**
 * Complete user registration flow
 *
 * Handles auth creation, profile storage, verification email, and session setup
 *
 * @param email - User's email address
 * @param password - User's password
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Promise resolving to the UserCredential and created user profile
 */
export const registerUser = async (
  form: SignUpForm
): Promise<{ userCredential: UserCredential; userProfile: User }> => {
  try {
    // Step 1: Create the auth user
    const userCredential = await createAuthUser(form.email, form.password);

    // Step 2: Create and save the user profile
    const userProfile = await createUserProfile(
      userCredential,
      form.firstName,
      form.lastName,
      form.age
    );
    await updateUserWithData(userProfile);

    // Step 3: Send verification email (non-blocking)
    sendVerificationEmail(userCredential).catch((error) =>
      console.error("Failed to send verification email:", error)
    );

    // Step 4: Set the session cookie
    await setSessionCookie(userCredential);

    // Return both the UserCredential and the created user profile
    return { userCredential, userProfile };
  } catch (error) {
    console.error("Error during user registration:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

// User Profile Operations
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "Profiles", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        isActive: data.isActive,
        ...data,
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    await updateDoc(doc(db, "Profiles", userId), data);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Swipe Operations
export const getUsersToSwipe = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    // Get the current user's profile to check their matches
    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );

    const matchedUsers = currentUserProfile.data()?.matchedUsers || [];

    // Get all users that have swiped right on the current user
    const swipedUsers = await getDocs(
      collection(db, "swipes", currentUser.uid, "swiped")
    );
    const swipedUserIds = swipedUsers.docs.map((doc) => doc.id);

    // Get all profiles
    const querySnapshot = await getDocs(collection(db, "Profiles"));
    const userData = querySnapshot.docs
      .map((doc) => ({
        ...(doc.data() as User),
      }))
      .filter((user: User) => {
        return (
          user.uid !== currentUser.uid && // Exclude current user
          user.isActive === true &&
          !matchedUsers.includes(user.uid) && // Exclude matched users
          !swipedUserIds.includes(user.uid) // Exclude users that have swiped right on
        );
      });

    return userData;
  } catch (error) {
    console.error("Error fetching users to swipe:", error);
    throw error;
  }
};

export const recordSwipe = async (
  swipedUserId: string,
  isRightSwipe: boolean
) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    // Get current user profile for matched users array
    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );
    const matchedUsers = currentUserProfile.data()?.matchedUsers || [];

    // Record the swipe
    await setDoc(doc(db, "swipes", currentUser.uid, "swiped", swipedUserId), {
      timestamp: serverTimestamp(),
      isRightSwipe,
    });

    // If it's a right swipe, check if the other user has also swiped right
    if (isRightSwipe) {
      const otherUserSwipe = await getDoc(
        doc(db, "swipes", swipedUserId, "swiped", currentUser.uid)
      );

      if (otherUserSwipe.exists() && otherUserSwipe.data().isRightSwipe) {
        // It's a match! Update both users' matchedUsers arrays
        await updateDoc(doc(db, "Profiles", currentUser.uid), {
          matchedUsers: [...matchedUsers, swipedUserId],
        });

        const otherUserProfile = await getDoc(
          doc(db, "Profiles", swipedUserId)
        );
        const otherUserMatchedUsers =
          otherUserProfile.data()?.matchedUsers || [];
        await updateDoc(doc(db, "Profiles", swipedUserId), {
          matchedUsers: [...otherUserMatchedUsers, currentUser.uid],
        });

        return true; // It's a match
      }
    }

    return false; // Not a match
  } catch (error) {
    console.error("Error recording swipe:", error);
    throw error;
  }
};

// Match Operations
export const getMatches = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );
    const matchedUserIds = currentUserProfile.data()?.matchedUsers || [];

    if (matchedUserIds.length === 0) {
      return [];
    }

    const matchesData = await Promise.all(
      matchedUserIds.map(async (userId: string) => {
        const userDoc = await getDoc(doc(db, "Profiles", userId));
        return { id: userDoc.id, ...userDoc.data() };
      })
    );

    return matchesData;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

// Message Operations
export const sendMessage = async (
  recipientId: string,
  message: string
): Promise<boolean> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const chatId = [currentUser.uid, recipientId].sort().join("_");

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: currentUser.uid,
      recipientId,
      message,
      timestamp: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getMessages = async (recipientId: string) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const chatId = [currentUser.uid, recipientId].sort().join("_");

    const messagesSnapshot = await getDocs(
      collection(db, `chats/${chatId}/messages`)
    );
    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Chat Operations
export const getChats = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );
    const matchedUserIds = currentUserProfile.data()?.matchedUsers || [];

    if (matchedUserIds.length === 0) {
      return [];
    }

    const chatsData = await Promise.all(
      matchedUserIds.map(async (userId: string) => {
        const userDoc = await getDoc(doc(db, "Profiles", userId));
        const chatId = [currentUser.uid, userId].sort().join("_");

        // Get the last message
        const messagesSnapshot = await getDocs(
          collection(db, `chats/${chatId}/messages`)
        );
        const messages = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : null;

        return {
          user: { id: userDoc.id, ...userDoc.data() },
          lastMessage,
          unreadCount: messages.filter(
            (m: any) => m.recipientId === currentUser.uid && !m.read
          ).length,
        };
      })
    );

    return chatsData;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};

/**
 * Upload a single image to Firebase Storage.
 * @param file - The image file to upload.
 * @param userId - The user ID used to structure the path in storage.
 * @param order - The order of the image.
 * @returns An object with the download URL and generated file ID.
 */
export const uploadProfileImage = async (
  file: File,
  userId: string
): Promise<{ id: string; url: string }> => {
  const storage = getStorage();
  const db = getFirestore();

  const photoId = `photo_${Date.now()}_`;
  const fileExtension =
    file.type.split("/")[1] || file.name.split(".").pop() || "jpg";

  const fileName = `${photoId}.${fileExtension}`;

  const storageRef = ref(storage, `users/${userId}/images/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    const userRef = doc(db, "Profiles", userId);
    const docSnap = await getDoc(userRef);
    const currPhotos: Photo[] = docSnap.data()?.photos || [];

    const newPhoto: Photo = {
      id: photoId,
      storageUrl: `users/${userId}/images/${fileName}`,
      downloadUrl,
      order: currPhotos.length,
      uploadedAt: new Date(),
      isProfilePhoto: currPhotos.length === 0,
    };

    await updateDoc(userRef, {
      photos: arrayUnion(newPhoto),
    });
    console.log(`Photo uploaded successfully: ${photoId}`);

    return {
      id: photoId,
      url: downloadUrl,
    };
  } catch (error) {
    console.error("Error adding photo:", error);
    throw new Error(
      `Failed to upload photo: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Remove a single image from Firebase Storage and Firestore.
 * @param userId - The user ID used to locate the file.
 * @param imageId - The image's unique identifier.
 */
export const removeProfileImage = async (
  userId: string,
  imageId: string
): Promise<void> => {
  const db = getFirestore();
  const storage = getStorage();

  try {
    // Get current photos
    const profileRef = doc(db, "Profiles", userId); // Match the collection name from upload
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      throw new Error("Profile not found");
    }

    const currentPhotos: Photo[] = profileSnap.data()?.photos || []; // Match field name from upload

    // Find the photo to get its storage info
    const photoToDelete = currentPhotos.find((photo) => photo.id === imageId);
    if (!photoToDelete) {
      throw new Error("Photo not found");
    }

    // Remove from Firestore and reorder remaining photos
    const updatedPhotos = currentPhotos
      .filter((photo: Photo) => photo.id !== imageId)
      .map((photo: Photo, index: number) => ({
        ...photo,
        order: index,
        // If deleted photo was profile photo, make first remaining photo the profile photo
        isProfilePhoto:
          photoToDelete.isProfilePhoto && index === 0
            ? true
            : photo.isProfilePhoto,
      }));

    await updateDoc(profileRef, { photos: updatedPhotos });

    // Delete from storage using the correct storage URL
    const imageRef = ref(storage, photoToDelete.storageUrl);
    await deleteObject(imageRef);

    console.log(`Photo removed successfully: ${imageId}`);
  } catch (error) {
    console.error("Error removing photo:", error);
    throw new Error(
      `Failed to remove photo: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getProfileImages = async (userId: string): Promise<Photo[]> => {
  const db = getFirestore();
  const profileRef = doc(db, "Profiles", userId);
  const profileSnap = await getDoc(profileRef);

  const currentPictures = profileSnap.data()?.photos || [];
  return currentPictures;
};

export function getFirebaseAuthErrorMessage(errorCode: string): string {
  return (
    FIREBASE_AUTH_ERRORS[errorCode as keyof typeof FIREBASE_AUTH_ERRORS] ||
    "Kirjautuminen epäonnistui. Yritä uudelleen."
  );
}
