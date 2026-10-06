import { Modal } from '@ui';

export interface DeleteConversationModalProps {
  isVisible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConversationModal = ({
  isVisible,
  isLoading,
  onClose,
  onConfirm,
}: DeleteConversationModalProps) => (
  <Modal
    isVisible={isVisible}
    onClose={onClose}
    title="Xoá đoạn chat này?"
    description="Đoạn chat sẽ bị xoá khỏi tài khoản của bạn. Người kia vẫn giữ lịch sử của họ, và tin nhắn mới sẽ làm đoạn chat hiện lại."
    confirmText="Xoá đoạn chat"
    cancelText="Huỷ"
    confirmVariant="danger"
    isConfirmLoading={isLoading}
    onConfirm={onConfirm}
  />
);
