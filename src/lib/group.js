// src/lib/group.js
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function createGroup(groupName) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const groupId = doc(collection(db, 'groups')).id;

  const groupRef = doc(db, 'groups', groupId);

  await setDoc(groupRef, {
    name: groupName,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    members: {
      [user.uid]: {
        role: 'admin',
      }
    }
  });

  console.log(`✅ Group "${groupName}" created with ID: ${groupId}`);
  return groupId;
}
