'use client';

import { useState } from 'react';
import { createGroup } from '@/lib/groups'; // place your `createGroup` logic here
import { Dialog } from '@headlessui/react';

export default function CreateGroupModal({ isOpen, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createGroup(groupName);
      setGroupName('');
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
        <Dialog.Title className="text-xl font-bold">Create Group</Dialog.Title>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="text-gray-500">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
