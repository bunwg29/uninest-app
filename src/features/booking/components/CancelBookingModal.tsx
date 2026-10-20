import { Modal } from '@ui';

export interface CancelBookingModalProps {
  isVisible: boolean;
  isLoading: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelBookingModal = ({
  isVisible,
  isLoading,
  title = 'Huỷ lịch hẹn?',
  description = 'Bạn có thể đặt lại nếu khung giờ vẫn còn trống.',
  confirmText = 'Huỷ lịch',
  onClose,
  onConfirm,
}: CancelBookingModalProps) => (
  <Modal
    isVisible={isVisible}
    onClose={onClose}
    title={title}
    description={description}
    confirmText={confirmText}
    cancelText="Không"
    confirmVariant="danger"
    isConfirmLoading={isLoading}
    onConfirm={onConfirm}
  />
);
