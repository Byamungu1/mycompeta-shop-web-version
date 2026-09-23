import { AddProductType } from '@/interfaces/interface';
import api from '@/utils/api';

// Get product categories
export const getProductCategories = async () => {
  const response = await api.get('categories/');
  return response;
};

export const getWebImageUri = (img: string | File | Blob | null | undefined): string => {
  if (!img) return '';

  // If it's a raw File or Blob object from an <input type="file" />
  if (typeof Blob !== 'undefined' && img instanceof Blob) {
    return URL.createObjectURL(img);
  }

  // If it's a string, strip any accidental native file:// prefixes
  if (typeof img === 'string') {
    return img.replace(/^file:\/\//, '');
  }

  return '';
};

// ── Web-Compatible Helper to convert Blob/HTTP URLs to File objects ──────────
const urlToFile = async (url: string, defaultName: string): Promise<File | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'jpeg';
    const filename = defaultName.includes('.') ? defaultName : `${defaultName}.${ext}`;
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  } catch (error) {
    console.error('Error converting URL to File:', error);
    return null;
  }
};

// ── Reusable Image Formatter Helper ──────────────────────────────────────────
const appendimgToFormData = async (
  formData: FormData,
  images: (string | File | Blob)[],
  fieldName: string = 'image'
) => {
  if (!images || images.length === 0) return;

  console.log(`Appending ${images.length} images to FormData under field "${fieldName}"`);

  for (let index = 0; index < images.length; index++) {
    const imgItem = images[index];
    if (!imgItem) continue;

    // 1. Raw File / Blob object directly from web picker/dropzone
    if (typeof File !== 'undefined' && imgItem instanceof File) {
      formData.append(fieldName, imgItem);
    } else if (typeof Blob !== 'undefined' && imgItem instanceof Blob) {
      const file = new File([imgItem], `product_${Date.now()}_${index}.jpg`, {
        type: imgItem.type || 'image/jpeg',
      });
      formData.append(fieldName, file);
    } 
    // 2. String handling (Blob URLs, Data URIs, or Remote HTTP URLs)
    else if (typeof imgItem === 'string') {
      // If it's a blob: or data: URI from local web preview
      if (imgItem.startsWith('blob:') || imgItem.startsWith('data:')) {
        const file = await urlToFile(imgItem, `product_${Date.now()}_${index}`);
        if (file) {
          formData.append(fieldName, file);
        }
      } 
      // If it's already a remote HTTP URL string (e.g., editing existing product)
      else if (imgItem.startsWith('http://') || imgItem.startsWith('https://')) {
        formData.append(fieldName, imgItem);
      }
      // Native fallback (React Native file:// or content://)
      else {
        const cleanUri = getWebImageUri(imgItem);
        const file = await urlToFile(cleanUri, `product_${Date.now()}_${index}`);
        if (file) {
          formData.append(fieldName, file);
        }
      }
    }
  }
};

// ── 1. ADD PRODUCT (POST) ────────────────────────────────────────────────────
export const addProduct = async (
  productData: AddProductType
): Promise<{ data: any | null; error: string | null }> => {
  const variantMandatoryCategoriey = ['clothing & apparel'];

  try {
    if (!productData) {
      throw new Error('Product data is missing entirely.');
    }

    const mandatoryFields: (keyof AddProductType)[] = [
      'name',
      'image',
      'price',
      'description',
      'category',
    ];

    if (variantMandatoryCategoriey.includes(productData.category.toLowerCase())) {
      mandatoryFields.push('variants');
    }

    for (const field of mandatoryFields) {
      const value = productData[field];

      if (value === undefined || value === null) {
        throw new Error(`${formatLabel(field)} is a required field.`);
      }

      if (typeof value === 'string' && value.trim() === '') {
        throw new Error(`${formatLabel(field)} is a required field.`);
      }

      if (Array.isArray(value) && value.length === 0) {
        throw new Error(`Please add at least one ${field.slice(0, -1)}.`);
      }

      if (field === 'price' && Number(value) <= 0) {
        throw new Error('Price must be greater than 0.');
      }
    }

    const formData = new FormData();

    formData.append('name', productData.name.trim());
    formData.append('category', productData.category);
    formData.append('description', productData.description.trim());
    formData.append('price', (Number(productData.price) || 0).toString());

    if (productData.features?.length) {
      formData.append('features', JSON.stringify(productData.features));
    }
    if (productData.variants?.length) {
      formData.append('variants', JSON.stringify(productData.variants));
    }
    if (productData.discount) {
      formData.append('discount', (Number(productData.discount) || 0).toString());
    }

    // Ensure array format for images
    const targetImages = Array.isArray(productData.image)
      ? productData.image
      : [productData.image];

    await appendimgToFormData(formData, targetImages, 'image');

    const response = await api.post('seller/products/', formData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { data: response.data, error: null };
  } catch (error: any) {
    let backendErrorMessage = 'An error occurred while saving the product.';

    if (error?.response?.data) {
      const errorData = error.response.data;

      if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.detail) {
          backendErrorMessage = errorData.detail;
        } else {
          backendErrorMessage = Object.entries(errorData)
            .map(([key, val]) => {
              const messages = Array.isArray(val) ? val.join(' ') : String(val);
              return `${key}: ${messages}`;
            })
            .join(' | ');
        }
      } else if (typeof errorData === 'string') {
        backendErrorMessage = errorData;
      }
    } else if (error.message) {
      backendErrorMessage = error.message;
    }

    return { data: null, error: backendErrorMessage };
  }
};

const formatLabel = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// ── FETCH PRODUCTS FOR BUYER ──────────────────────────────────────────────────
export const fetchProductsData = async (categorySlug: string | null = null) => {
  const url = categorySlug && categorySlug !== 'all' ? `products/?slug=${categorySlug}` : 'products/';
  return await api.get(url);
};

export const fetchProductDetails = async (id: number | string) => {
  return await api.get(`products/${id}/?as=buyer`);
};

export const fetchPopularProducts = async () => {
  return await api.get('products/popular/');
};

export const fetchFoodAndSnacksProducts = async (buyerCoordinates?: { latitude: number; longitude: number }) => {
  const params = new URLSearchParams();
  params.append('category', 'Food & Snacks');

  if (buyerCoordinates) {
    params.append('buyer_lat', buyerCoordinates.latitude.toString());
    params.append('buyer_lng', buyerCoordinates.longitude.toString());
  }

  return await api.get(`products/nearby/?${params.toString()}`);
};

// ── SELLER API CALLS ──────────────────────────────────────────────────────────
export const fetchSellerProducts = async (category = '') => {
  return await api.get(`seller/products/?slug=${category}`);
};

export const fetchSellerProductDetails = async (id: string | number) => {
  return await api.get(`products/${id}/?as=seller`);
};

export const updateSellerProduct = async (productId: string | number, form: AddProductType) => {
  console.log('the images to be updated', form.image);
  
  const data = new FormData();
  data.append('name', form.name);
  data.append('category', form.category);
  data.append('description', form.description);
  data.append('price', (Number(form.price) || 0).toString());

  if (form.variants?.length) {
    data.append('variants', JSON.stringify(form.variants));
  }
  if (form.discount !== undefined && form.discount !== null) {
    data.append('discount', form.discount.toString());
  }

  const targetImages = Array.isArray(form.image) ? form.image : [form.image];
  await appendimgToFormData(data, targetImages, 'image');

  return await api.patch(`seller/products/${productId}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteSellerProduct = async (productId: string | number) => {
  return await api.delete(`seller/products/${productId}/`);
};