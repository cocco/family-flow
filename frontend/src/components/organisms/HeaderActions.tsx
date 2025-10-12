import React from 'react';
import { Button } from '../atoms/Button';

export interface HeaderActionsProps {
  onOpenChore: () => void;
  onOpenBonus: () => void;
  onLogout: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ onOpenChore, onOpenBonus, onLogout }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={onOpenChore}
        aria-haspopup="dialog"
        aria-controls="create-chore-dialog"
      >
        Create Chore
      </Button>
      <Button
        type="button"
        variant="success"
        onClick={onOpenBonus}
        aria-haspopup="dialog"
        aria-controls="create-bonus-dialog"
      >
        Create Bonus Task
      </Button>
      <Button type="button" variant="danger" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
};

export default HeaderActions;


