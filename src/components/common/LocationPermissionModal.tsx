import { MapPin, X } from 'lucide-react';
import React from 'react';
import { Modal, TouchableOpacity } from '@/components/common/ui';

interface LocationPermissionModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onEnableLocation: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  onRequestClose,
  onEnableLocation,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <div className="flex-1 bg-black/60 justify-center items-center px-6">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
          {/* Header */}
          <div className="flex-row items-center justify-between mb-4">
            <div className="flex-row items-center gap-2">
              <div className="w-10 h-10 bg-brand-100 rounded-full items-center justify-center">
                <MapPin size={20} color="#F59E0B" />
              </div>
              <p className="text-lg font-jakarta-bold text-sand-900">
                Enable Location
              </p>
            </div>
            <TouchableOpacity onPress={onRequestClose} className="p-1">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm font-jakarta text-sand-600 leading-relaxed mb-3">
              Turn on location to discover nearby Food & Snacks products within 1km of your current location.
            </p>
            <p className="text-sm font-jakarta text-sand-600 leading-relaxed">
              We'll use your location to show you products from sellers near you and provide accurate delivery estimates.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-sand-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-jakarta-bold text-sand-700 uppercase tracking-wider mb-2">
              Benefits
            </p>
            <div className="space-y-2">
              <div className="flex-row items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5" />
                <p className="text-xs font-jakarta text-sand-600">
                  Discover nearby Food & Snacks
                </p>
              </div>
              <div className="flex-row items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5" />
                <p className="text-xs font-jakarta text-sand-600">
                  Get accurate delivery times
                </p>
              </div>
              <div className="flex-row items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5" />
                <p className="text-xs font-jakarta text-sand-600">
                  Find sellers closest to you
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <TouchableOpacity
              onPress={onEnableLocation}
              className="bg-brand-500 py-3 rounded-xl items-center"
            >
              <p className="text-white font-jakarta-bold text-sm">
                Enable Location
              </p>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onRequestClose}
              className="py-3 items-center"
            >
              <p className="text-sand-500 font-jakarta-medium text-sm">
                Maybe Later
              </p>
            </TouchableOpacity>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LocationPermissionModal;