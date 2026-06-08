export const mockUploadCV = async (_file: File) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, chunks: ["chunk1", "chunk2"] };
};

export const mockGetCVStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { isUploaded: true, chunks: ["chunk1", "chunk2"] };
};
