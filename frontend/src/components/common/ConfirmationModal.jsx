import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
            <p className="text-sm text-gray-500">
                {message}
            </p>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 flex justify-center gap-x-4">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
          onClick={onClose}
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
          onClick={onConfirm}
        >
          Xác nhận
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
