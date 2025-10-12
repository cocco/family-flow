import React, { RefObject } from 'react';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';

export interface CreateBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
}

export const CreateBonusModal: React.FC<CreateBonusModalProps> = ({
  isOpen,
  onClose,
  triggerRef,
  dialogRef,
}) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [rewardAmount, setRewardAmount] = React.useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" aria-labelledby="create-bonus-title" role="dialog" aria-modal="true">
      <div
        id="create-bonus-dialog"
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
        <h3 id="create-bonus-title" className="text-lg font-semibold text-gray-900">Create Bonus Task</h3>
        <div className="mt-4 space-y-3">
          <FormField label="Title" htmlFor="bonus-title">
            <Input
              id="bonus-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Wash the car"
            />
          </FormField>
          <FormField label="Description (optional)" htmlFor="bonus-description">
            <Textarea
              id="bonus-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details"
            />
          </FormField>
          <FormField label="Reward Amount ($)" htmlFor="bonus-reward">
            <Input
              id="bonus-reward"
              type="number"
              min={0}
              step={0.5}
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
              placeholder="e.g., 5"
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
            variant="success"
            onClick={() => {
              // UI-only: no persistence in Phase 2
              onClose();
              setTitle('');
              setDescription('');
              setRewardAmount(0);
              triggerRef.current?.focus();
            }}
            aria-disabled={!title || rewardAmount <= 0}
            disabled={!title || rewardAmount <= 0}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateBonusModal;


