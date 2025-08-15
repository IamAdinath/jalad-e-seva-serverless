/**
 * Convert a File object to a base64-encoded string.
 * @param file File object from input[type="file"]
 * @param asDataUrl Whether to return with `data:/*;base64,` prefix (default: false)
 * @returns Promise<string> Base64 string
 */

export function fileToBase64(file: File, asDataUrl: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      if (asDataUrl) {
        resolve(result); // Includes "data:...;base64," prefix
      } else {
        const base64 = result.split(",")[1] || result; // Strip prefix
        resolve(base64);
      }
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
}
