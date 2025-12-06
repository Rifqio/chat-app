import { Avatar, Button } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import type { User } from '@/types';

type UserPickerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    users: User[];
    onSelect?: (user: User) => void;
};

export function UserPickerModal({
    isOpen,
    onClose,
    currentUserId,
    users,
    onSelect,
}: UserPickerModalProps) {
    const filtered = users.filter((u) => u.id !== currentUserId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start a chat">
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filtered.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No other users found. Invite someone to get started.
                    </p>
                ) : (
                    filtered.map((u) => (
                        <button
                            key={u.id}
                            className="w-full flex items-center gap-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors px-3 py-2 text-left cursor-pointer"
                            onClick={() => {
                                onSelect?.(u);
                                onClose();
                            }}
                        >
                            <Avatar
                                src={u.avatar}
                                name={u.name}
                                size="sm"
                                status={u.status}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {u.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {u.email}
                                </p>
                            </div>
                            <span className="text-xs text-slate-500 capitalize">
                                {u.status}
                            </span>
                        </button>
                    ))
                )}
            </div>
            <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
}
