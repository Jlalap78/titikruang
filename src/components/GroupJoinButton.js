"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function GroupJoinButton({ groupId, className = "" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null); // null | 'pending' | 'member'
  const [loading, setLoading] = useState(false);

  const lastSnapshotAt = useRef(0);
  const pollIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!groupId || !user) {
      setStatus(null);
      return;
    }

    const memberDocRef = doc(db, "groups", groupId, "members", user.uid);

    const unsubDoc = onSnapshot(
      memberDocRef,
      (snap) => {
        lastSnapshotAt.current = Date.now();
        if (!snap.exists()) {
          console.debug("[GroupJoinButton] snapshot: no doc -> null");
          setStatus(null);
          return;
        }
        const data = snap.data();
        const asStatus =
          data.status ||
          (data.approved ? "member" : null) ||
          (data.role === "member" ? "member" : null) ||
          null;
        console.debug("[GroupJoinButton] snapshot doc", asStatus, data);
        setStatus(
          asStatus === "member"
            ? "member"
            : asStatus === "pending"
            ? "pending"
            : null
        );
      },
      (err) => console.error("[GroupJoinButton] snapshot error", err)
    );

    return () => {
      unsubDoc();
    };
  }, [groupId, user]);

  // Polling fallback: if no snapshot update after join request, poll getDoc a few times
  useEffect(() => {
    // start polling only after we made a join request (status === 'pending')
    if (status !== "pending" || !groupId || !user) return;

    // reset attempts and start interval
    pollAttemptsRef.current = 0;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      try {
        const docRef = doc(db, "groups", groupId, "members", user.uid);
        const snap = await getDoc(docRef);
        console.debug(
          `[GroupJoinButton] polling attempt ${pollAttemptsRef.current}`,
          snap.exists() ? snap.data() : null
        );
        if (snap.exists()) {
          const data = snap.data();
          const asStatus =
            data.status ||
            (data.approved ? "member" : null) ||
            (data.role === "member" ? "member" : null) ||
            null;
          if (asStatus === "member") {
            setStatus("member");
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error("[GroupJoinButton] polling error", err);
      }

      // stop polling after 15 attempts (~30s if interval 2s)
      if (pollAttemptsRef.current >= 15) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [status, groupId, user]);

  const handleJoin = async (e) => {
    e?.preventDefault?.();
    if (!user) return router.push("/login");
    if (status === "member") return router.push(`/diskusi/${groupId}`);

    setLoading(true);
    try {
      const memberDocRef = doc(db, "groups", groupId, "members", user.uid);
      await setDoc(
        memberDocRef,
        {
          uid: user.uid,
          status: "pending",
          requestedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.debug(
        "[GroupJoinButton] join request written, waiting for snapshot/poll"
      );
      // status will be updated by snapshot or polling
    } catch (err) {
      console.error("[GroupJoinButton] join error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e) => {
    e?.preventDefault?.();
    router.push(`/diskusi/${groupId}`);
  };

  const handleLeave = async (e) => {
    e?.preventDefault?.();
    if (!user) return;
    try {
      await deleteDoc(doc(db, "groups", groupId, "members", user.uid));
      setStatus(null);
    } catch (err) {
      console.error("[GroupJoinButton] leave error", err);
    }
  };

  // UI
  if (!user) {
    return (
      <button
        className={`px-4 py-2 rounded ${className}`}
        onClick={() => router.push("/login")}
      >
        Gabung
      </button>
    );
  }

  if (status === "member") {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleEnter}
          className={`px-4 py-2 rounded bg-blue-600 text-white ${className}`}
        >
          Masuk
        </button>
        <button
          onClick={handleLeave}
          className="px-3 py-2 rounded border text-sm"
          title="Keluar dari grup"
        >
          Keluar
        </button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <button className={`px-4 py-2 rounded bg-yellow-400 ${className}`} disabled>
        Menunggu...
      </button>
    );
  }

  return (
    <button
      onClick={handleJoin}
      className={`px-4 py-2 rounded bg-green-600 text-white ${className}`}
      disabled={loading}
    >
      {loading ? "Memproses..." : "Gabung"}
    </button>
  );
}