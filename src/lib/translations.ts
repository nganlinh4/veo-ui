export type Language = 'en' | 'vi';

export interface Translations {
  // Main App
  app: {
    title: string;
    description: string;
    connected: string;
    notConfigured: string;
    totalJobs: string;
  };

  // Navigation
  tabs: {
    textToVideo: string;
    imageToVideo: string;
    monitor: string;
    gallery: string;
    settings: string;
  };
  
  // Text to Video
  textToVideo: {
    title: string;
    description: string;
    textPrompt: string;
    textPromptPlaceholder: string;
    numberOfVideos: string;
    duration: string;
    storageUri: string;
    storageUriPlaceholder: string;
    enhancePrompt: string;
    generateVideo: string;
    generating: string;
    failedToGenerate: string;
  };
  
  // Image to Video
  imageToVideo: {
    title: string;
    description: string;
    uploadImage: string;
    clickToUpload: string;
    recommendedSpecs: string;
    textPromptOptional: string;
    textPromptPlaceholder: string;
    numberOfVideos: string;
    duration: string;
    storageUri: string;
    storageUriPlaceholder: string;
    enhancePrompt: string;
    generateVideo: string;
    generating: string;
    failedToGenerate: string;
    pleaseSelectValidImage: string;
  };
  
  // Settings
  settings: {
    title: string;
    description: string;
    checkingAuth: string;
    authenticatedWithGoogleCloud: string;
    account: string;
    automaticTokenRetrieval: string;
    googleCloudAuthRequired: string;
    clickToSignIn: string;
    manualAuthRequired: string;
    automaticAuthNotAvailable: string;
    authCheckFailed: string;
    checkIfGoogleCloudSDK: string;
    authenticating: string;
    authenticate: string;
    refresh: string;
    setupInstructions: string;
    createGoogleCloudProject: string;
    runSetupScript: string;
    manuallyInstallSDK: string;
    enterProjectId: string;
    getTokenManually: string;
    googleCloudProjectId: string;
    projectIdPlaceholder: string;
    projectIdDetected: string;
    accessTokenManual: string;
    accessTokenPlaceholder: string;
    onlyRequiredIfAutoAuth: string;
    configurationSaved: string;
    project: string;
    resetConfiguration: string;
    configureWithAutoAuth: string;
    saveConfiguration: string;
    additionalResources: string;
    veoApiDocumentation: string;
    authenticationGuide: string;
    enableVertexAI: string;
    pleaseEnterValidProjectId: string;
    pleaseEnterValidAccessToken: string;
    successfullyAuthenticated: string;
    alreadyAuthenticated: string;
    authenticationFailed: string;
    authenticationFailedTryAgain: string;
  };
  
  // Operation Monitor
  monitor: {
    title: string;
    description: string;
    noJobsYet: string;
    activeJobs: string;
    completedJobs: string;
    started: string;
    completed: string;
    checkStatus: string;
    startPolling: string;
    polling: string;
    videosGenerated: string;
    error: string;
    pending: string;
    running: string;
    failed: string;
  };
  
  // Video Gallery
  gallery: {
    title: string;
    description: string;
    noCompletedVideos: string;
    generated: string;
    duration: string;
    count: string;
    enhanced: string;
    yes: string;
    no: string;
    videoStoredInCloudStorage: string;
    videoNotAvailable: string;
    download: string;
    open: string;
    failedToDownload: string;
    browserNotSupported: string;
  };
  
  // Common
  common: {
    unknownError: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    app: {
      title: 'Veo Video Generator',
      description: 'Generate high-quality videos using Google\'s Veo AI model',
      connected: 'Connected',
      notConfigured: 'Not configured',
      totalJobs: 'total jobs',
    },
    tabs: {
      textToVideo: 'Text to Video',
      imageToVideo: 'Image to Video',
      monitor: 'Monitor',
      gallery: 'Gallery',
      settings: 'Settings',
    },
    textToVideo: {
      title: 'Text to Video',
      description: 'Generate videos from text descriptions using Veo AI',
      textPrompt: 'Text Prompt',
      textPromptPlaceholder: 'Describe the video you want to generate...',
      numberOfVideos: 'Number of Videos (1-4)',
      duration: 'Duration (5-8 seconds)',
      storageUri: 'Storage URI (optional)',
      storageUriPlaceholder: 'gs://your-bucket/output/',
      enhancePrompt: 'Enhance prompt with AI',
      generateVideo: 'Generate Video',
      generating: 'Generating...',
      failedToGenerate: 'Failed to generate video',
    },
    imageToVideo: {
      title: 'Image to Video',
      description: 'Generate videos from images with optional text descriptions',
      uploadImage: 'Upload Image',
      clickToUpload: 'Click to upload an image (JPEG or PNG)',
      recommendedSpecs: 'Recommended: 720p or higher, 16:9 or 9:16 aspect ratio',
      textPromptOptional: 'Text Prompt (optional)',
      textPromptPlaceholder: 'Describe how the image should animate...',
      numberOfVideos: 'Number of Videos (1-4)',
      duration: 'Duration (5-8 seconds)',
      storageUri: 'Storage URI (optional)',
      storageUriPlaceholder: 'gs://your-bucket/output/',
      enhancePrompt: 'Enhance prompt with AI',
      generateVideo: 'Generate Video',
      generating: 'Generating...',
      failedToGenerate: 'Failed to generate video',
      pleaseSelectValidImage: 'Please select a valid image file (JPEG or PNG)',
    },
    settings: {
      title: 'Configuration',
      description: 'Configure your Google Cloud project and authentication',
      checkingAuth: 'Checking Google Cloud authentication...',
      authenticatedWithGoogleCloud: '✅ Authenticated with Google Cloud',
      account: 'Account',
      automaticTokenRetrieval: 'Automatic token retrieval is available',
      googleCloudAuthRequired: 'Google Cloud authentication required',
      clickToSignIn: 'Click "Authenticate with Google Cloud" below to sign in automatically',
      manualAuthRequired: 'Manual authentication required',
      automaticAuthNotAvailable: 'Automatic authentication not available. Please enter credentials manually.',
      authCheckFailed: 'Authentication check failed',
      checkIfGoogleCloudSDK: 'Please check if Google Cloud SDK is installed and try manual authentication',
      authenticating: 'Authenticating...',
      authenticate: 'Authenticate',
      refresh: 'Refresh',
      setupInstructions: 'Setup Instructions:',
      createGoogleCloudProject: 'Create a Google Cloud project and enable the Vertex AI API',
      runSetupScript: 'Run the setup script (setup-and-run.bat) for automatic installation and authentication',
      manuallyInstallSDK: 'Or manually: Install Google Cloud SDK and run',
      enterProjectId: 'Enter your project ID below',
      getTokenManually: 'If automatic authentication fails, get a token manually:',
      googleCloudProjectId: 'Google Cloud Project ID',
      projectIdPlaceholder: 'your-project-id',
      projectIdDetected: '✅ Project ID detected automatically',
      accessTokenManual: 'Access Token (Manual)',
      accessTokenPlaceholder: 'ya29....',
      onlyRequiredIfAutoAuth: 'Only required if automatic authentication is not available. Get your access token by running:',
      configurationSaved: '✓ Configuration saved successfully',
      project: 'Project',
      resetConfiguration: 'Reset Configuration',
      configureWithAutoAuth: 'Configure with Auto-Auth',
      saveConfiguration: 'Save Configuration',
      additionalResources: 'Additional Resources',
      veoApiDocumentation: '→ Veo API Documentation',
      authenticationGuide: '→ Authentication Guide',
      enableVertexAI: '→ Enable Vertex AI API',
      pleaseEnterValidProjectId: 'Please enter a valid Project ID',
      pleaseEnterValidAccessToken: 'Please enter a valid Access Token or use automatic authentication',
      successfullyAuthenticated: 'Successfully authenticated as',
      alreadyAuthenticated: 'Already authenticated as',
      authenticationFailed: 'Authentication failed',
      authenticationFailedTryAgain: 'Authentication failed. Please try again.',
    },
    monitor: {
      title: 'Operation Monitor',
      description: 'Track the status of your video generation jobs',
      noJobsYet: 'No video generation jobs yet',
      activeJobs: 'Active Jobs',
      completedJobs: 'Completed Jobs',
      started: 'Started',
      completed: 'Completed',
      checkStatus: 'Check Status',
      startPolling: 'Start Polling',
      polling: 'Polling...',
      videosGenerated: 'video(s) generated',
      error: 'Error',
      pending: 'Pending',
      running: 'Running',
      failed: 'Failed',
    },
    gallery: {
      title: 'Video Gallery',
      description: 'View and download your generated videos',
      noCompletedVideos: 'No completed videos yet',
      generated: 'Generated',
      duration: 'Duration',
      count: 'Count',
      enhanced: 'Enhanced',
      yes: 'Yes',
      no: 'No',
      videoStoredInCloudStorage: 'Video stored in Cloud Storage',
      videoNotAvailable: 'Video not available',
      download: 'Download',
      open: 'Open',
      failedToDownload: 'Failed to download video',
      browserNotSupported: 'Your browser does not support the video tag.',
    },
    common: {
      unknownError: 'Unknown error',
    },
  },
  vi: {
    app: {
      title: 'Trình tạo Video Veo',
      description: 'Tạo video chất lượng cao bằng mô hình Veo AI của Google',
      connected: 'Đã kết nối',
      notConfigured: 'Chưa cấu hình',
      totalJobs: 'tổng số công việc',
    },
    tabs: {
      textToVideo: 'Văn bản thành Video',
      imageToVideo: 'Hình ảnh thành Video',
      monitor: 'Giám sát',
      gallery: 'Thư viện',
      settings: 'Cài đặt',
    },
    textToVideo: {
      title: 'Văn bản thành Video',
      description: 'Tạo video từ mô tả văn bản bằng Veo AI',
      textPrompt: 'Lời nhắc văn bản',
      textPromptPlaceholder: 'Mô tả video bạn muốn tạo...',
      numberOfVideos: 'Số lượng Video (1-4)',
      duration: 'Thời lượng (5-8 giây)',
      storageUri: 'URI lưu trữ (tùy chọn)',
      storageUriPlaceholder: 'gs://bucket-của-bạn/đầu-ra/',
      enhancePrompt: 'Cải thiện lời nhắc bằng AI',
      generateVideo: 'Tạo Video',
      generating: 'Đang tạo...',
      failedToGenerate: 'Không thể tạo video',
    },
    imageToVideo: {
      title: 'Hình ảnh thành Video',
      description: 'Tạo video từ hình ảnh với mô tả văn bản tùy chọn',
      uploadImage: 'Tải lên Hình ảnh',
      clickToUpload: 'Nhấp để tải lên hình ảnh (JPEG hoặc PNG)',
      recommendedSpecs: 'Khuyến nghị: 720p trở lên, tỷ lệ khung hình 16:9 hoặc 9:16',
      textPromptOptional: 'Lời nhắc văn bản (tùy chọn)',
      textPromptPlaceholder: 'Mô tả cách hình ảnh nên chuyển động...',
      numberOfVideos: 'Số lượng Video (1-4)',
      duration: 'Thời lượng (5-8 giây)',
      storageUri: 'URI lưu trữ (tùy chọn)',
      storageUriPlaceholder: 'gs://bucket-của-bạn/đầu-ra/',
      enhancePrompt: 'Cải thiện lời nhắc bằng AI',
      generateVideo: 'Tạo Video',
      generating: 'Đang tạo...',
      failedToGenerate: 'Không thể tạo video',
      pleaseSelectValidImage: 'Vui lòng chọn tệp hình ảnh hợp lệ (JPEG hoặc PNG)',
    },
    settings: {
      title: 'Cấu hình',
      description: 'Cấu hình dự án Google Cloud và xác thực của bạn',
      checkingAuth: 'Đang kiểm tra xác thực Google Cloud...',
      authenticatedWithGoogleCloud: '✅ Đã xác thực với Google Cloud',
      account: 'Tài khoản',
      automaticTokenRetrieval: 'Truy xuất token tự động có sẵn',
      googleCloudAuthRequired: 'Yêu cầu xác thực Google Cloud',
      clickToSignIn: 'Nhấp "Xác thực với Google Cloud" bên dưới để đăng nhập tự động',
      manualAuthRequired: 'Yêu cầu xác thực thủ công',
      automaticAuthNotAvailable: 'Xác thực tự động không khả dụng. Vui lòng nhập thông tin đăng nhập thủ công.',
      authCheckFailed: 'Kiểm tra xác thực thất bại',
      checkIfGoogleCloudSDK: 'Vui lòng kiểm tra xem Google Cloud SDK đã được cài đặt và thử xác thực thủ công',
      authenticating: 'Đang xác thực...',
      authenticate: 'Xác thực',
      refresh: 'Làm mới',
      setupInstructions: 'Hướng dẫn thiết lập:',
      createGoogleCloudProject: 'Tạo dự án Google Cloud và kích hoạt Vertex AI API',
      runSetupScript: 'Chạy script thiết lập (setup-and-run.bat) để cài đặt và xác thực tự động',
      manuallyInstallSDK: 'Hoặc thủ công: Cài đặt Google Cloud SDK và chạy',
      enterProjectId: 'Nhập ID dự án của bạn bên dưới',
      getTokenManually: 'Nếu xác thực tự động thất bại, lấy token thủ công:',
      googleCloudProjectId: 'ID Dự án Google Cloud',
      projectIdPlaceholder: 'id-dự-án-của-bạn',
      projectIdDetected: '✅ ID dự án được phát hiện tự động',
      accessTokenManual: 'Access Token (Thủ công)',
      accessTokenPlaceholder: 'ya29....',
      onlyRequiredIfAutoAuth: 'Chỉ cần thiết nếu xác thực tự động không khả dụng. Lấy access token bằng cách chạy:',
      configurationSaved: '✓ Cấu hình đã được lưu thành công',
      project: 'Dự án',
      resetConfiguration: 'Đặt lại Cấu hình',
      configureWithAutoAuth: 'Cấu hình với Xác thực Tự động',
      saveConfiguration: 'Lưu Cấu hình',
      additionalResources: 'Tài nguyên bổ sung',
      veoApiDocumentation: '→ Tài liệu Veo API',
      authenticationGuide: '→ Hướng dẫn Xác thực',
      enableVertexAI: '→ Kích hoạt Vertex AI API',
      pleaseEnterValidProjectId: 'Vui lòng nhập ID dự án hợp lệ',
      pleaseEnterValidAccessToken: 'Vui lòng nhập Access Token hợp lệ hoặc sử dụng xác thực tự động',
      successfullyAuthenticated: 'Xác thực thành công với tư cách',
      alreadyAuthenticated: 'Đã xác thực với tư cách',
      authenticationFailed: 'Xác thực thất bại',
      authenticationFailedTryAgain: 'Xác thực thất bại. Vui lòng thử lại.',
    },
    monitor: {
      title: 'Giám sát Hoạt động',
      description: 'Theo dõi trạng thái các công việc tạo video của bạn',
      noJobsYet: 'Chưa có công việc tạo video nào',
      activeJobs: 'Công việc Đang hoạt động',
      completedJobs: 'Công việc Đã hoàn thành',
      started: 'Bắt đầu',
      completed: 'Hoàn thành',
      checkStatus: 'Kiểm tra Trạng thái',
      startPolling: 'Bắt đầu Polling',
      polling: 'Đang polling...',
      videosGenerated: 'video đã tạo',
      error: 'Lỗi',
      pending: 'Đang chờ',
      running: 'Đang chạy',
      failed: 'Thất bại',
    },
    gallery: {
      title: 'Thư viện Video',
      description: 'Xem và tải xuống các video đã tạo của bạn',
      noCompletedVideos: 'Chưa có video hoàn thành nào',
      generated: 'Đã tạo',
      duration: 'Thời lượng',
      count: 'Số lượng',
      enhanced: 'Đã cải thiện',
      yes: 'Có',
      no: 'Không',
      videoStoredInCloudStorage: 'Video được lưu trữ trong Cloud Storage',
      videoNotAvailable: 'Video không khả dụng',
      download: 'Tải xuống',
      open: 'Mở',
      failedToDownload: 'Không thể tải xuống video',
      browserNotSupported: 'Trình duyệt của bạn không hỗ trợ thẻ video.',
    },
    common: {
      unknownError: 'Lỗi không xác định',
    },
  },
};

export const getTranslation = (language: Language): Translations => {
  return translations[language];
};
