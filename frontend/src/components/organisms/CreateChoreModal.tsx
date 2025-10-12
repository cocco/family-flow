import React, { RefObject } from 'react';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import type { UserDto } from '../../api/types';
import { mockClient } from '../../api/mockClient';

export interface CreateChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
  currentUser: UserDto | null;
  currentMonth: number;
  currentYear: number;
  onError: (message: string | null) => void;
}

export const CreateChoreModal: React.FC<CreateChoreModalProps> = ({
  isOpen,
  onClose,
  triggerRef,
  dialogRef,
  currentUser,
  currentMonth,
  currentYear,
  onError,
}) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" aria-labelledby="create-chore-title" role="dialog" aria-modal="true">
      <div
        id="create-chore-dialog"
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
            triggerRef.current?.focus();
          }
        }}
      >
        <h3 id="create-chore-title" className="text-lg font-semibold text-gray-900">Create Chore</h3>
        <div className="mt-4 space-y-3">
          <FormField label="Title" htmlFor="chore-title">
            <Input
              id="chore-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Take out trash"
            />
          </FormField>
          <FormField label="Description (optional)" htmlFor="chore-description">
            <Textarea
              id="chore-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details"
            />
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
              triggerRef.current?.focus();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={async () => {
              const ctx = { currentUser } as { currentUser: UserDto | null };
              const res = await mockClient.createChoresForAllChildren(ctx, title, description, currentMonth, currentYear);
              if ('error' in res) {
                onError(res.error.message);
              } else {
                onError(null);
              }
              onClose();
              setTitle('');
              setDescription('');
              triggerRef.current?.focus();
            }}
            aria-disabled={!title}
            disabled={!title}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateChoreModal;


