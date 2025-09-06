import React from 'react';

interface ProfileEditFormProps {
  name: string;
  bio: string;
  error: string;
  profilePicturePreview: string | null;
  profilePictureUrl: string | undefined;
  isUploading: boolean;
  isDragOver: boolean;
  saveProfileMutation: any;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBioChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  name,
  bio,
  error,
  profilePicturePreview,
  profilePictureUrl,
  isUploading,
  isDragOver,
  saveProfileMutation,
  onNameChange,
  onBioChange,
  onProfilePictureChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onCancel,
  onSave,
}) => {
  return (
    <form
      onSubmit={onSave}
      className="bg-white/98 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-100/50 p-8 space-y-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Edit Profile
          </h3>
          <p className="text-sm text-gray-500 mt-1">Update your profile information</p>
        </div>
        <button 
          type="button" 
          onClick={onCancel} 
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-2 rounded-full transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {error && (
        <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-4 text-sm text-red-800 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}
      {/* Profile Picture Upload */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-800">
          Profile Picture
          <span className="text-gray-500 font-normal ml-2">Optional</span>
        </label>
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-3 border-white shadow-lg ring-1 ring-gray-200/50 group hover:shadow-xl transition-all duration-300">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : profilePictureUrl ? (
                <img src={profilePictureUrl} alt="Current" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400 group-hover:text-gray-500 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50/50 scale-[1.02]'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/30'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profile-picture-input"
                onChange={onProfilePictureChange}
              />
              <label htmlFor="profile-picture-input" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>
                    <span className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                      Choose Image
                    </span>
                    <span className="text-sm text-gray-500 ml-1">or drag & drop</span>
                  </div>
                </div>
              </label>
              <div className="mt-3 text-xs text-gray-500">
                PNG, JPG up to 5MB
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Name Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Display Name
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={onNameChange}
          className="block w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:border-gray-400"
          placeholder="Enter your display name"
          required
        />
      </div>
      {/* Bio Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800">
          Bio
          <span className="text-gray-500 font-normal ml-2">Optional</span>
        </label>
        <textarea
          value={bio}
          onChange={onBioChange}
          className="block w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:border-gray-400 resize-none"
          rows={4}
          placeholder="Tell people about yourself..."
        />
      </div>
      <div className="flex justify-center gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="w-32 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300/50 transition-all duration-200 cursor-pointer flex items-center justify-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUploading || saveProfileMutation.isPending}
          className="w-32 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isUploading || saveProfileMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="text-sm">
            {isUploading || saveProfileMutation.isPending ? 'Saving...' : 'Save'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
