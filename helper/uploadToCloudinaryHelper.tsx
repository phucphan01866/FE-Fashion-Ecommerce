const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default async function uploadToCloudinary(file: File, folder?: string, fileName?: string): Promise<{ imageUrl: string; public_id: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', `fashion_ecommerce/${folder}`);
    // if (fileName) form.append('public_id', fileName);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const res = await fetch(endpoint, { method: 'POST', body: form });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { imageUrl: data.secure_url as string, public_id: data.public_id as string };
}