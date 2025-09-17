import React, { useState, useEffect } from 'react';
import { createCatalogue, updateCatalogue, buildFormData, fileToBase64 } from './catalogueApi';
import { getCategories } from '../category/categoryApi';
import { getOrganizations } from '../../organization/organizationApi';
import { compressImage } from '../../../utils/imageCompression';
import { generateBarcodeNumber, generateLongBarcodeNumber, BarcodeData } from '../../../utils/barcodeGenerator';
import BarcodeDisplay from '../../../components/BarcodeDisplay';
import { Catalogue } from './types';
import { Category } from '../category/types';
import { Organization } from '../../organization/types';

const initialState: Catalogue = {
  itemId: '',
  sku: '',
  itemName: '',
  categoryId: '',
  volumeOfMeasurement: '',
  sourceOfOrigin: '',
  nutritionValue: {},
  certification: '',
  price: 0,
  stock: 0,
  barcode: '',
  status: 'active',
  image: '',
  images: [],
  thumbnail: '',
  instructions: '',
  expiry: '', // expiry as string
  organizationId: '',
};

interface AddCataloguePageProps {
  onBack: () => void;
  editId?: string;
  editData?: Catalogue;
}

const AddCataloguePage: React.FC<AddCataloguePageProps> = ({ onBack, editId, editData }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Catalogue>(initialState);
  const [error, setError] = useState('');
  // Existing image URLs/base64 (from server)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // Newly added images (files) and their base64 versions
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagesBase64, setNewImagesBase64] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [volumeValue, setVolumeValue] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('');
  const [barcodeType, setBarcodeType] = useState<'12' | '16'>('12');
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [expiryValue, setExpiryValue] = useState('');
  const [expiryUnit, setExpiryUnit] = useState<'hours' | 'days'>('hours');
  // Compat state used by recent edits
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [thumbnailIdx, setThumbnailIdx] = useState<number>(0);

  useEffect(() => {
    if (editData) {
      setForm(editData);
      // Initialize existing images (prefer images[], fallback to legacy image)
      const serverImages = Array.isArray(editData.images) && editData.images.length > 0
        ? editData.images
        : (editData.image ? [editData.image] : []);
      setExistingImages(serverImages);
      // Initialize thumbnail
      if (editData.thumbnail) {
        setThumbnail(editData.thumbnail);
      } else if (serverImages.length > 0) {
        setThumbnail(serverImages[0]);
      }
      // Parse existing volume of measurement
      if (editData.volumeOfMeasurement) {
        const volumeMatch = editData.volumeOfMeasurement.match(/^(\d+(?:\.\d+)?)\s*(kg|gm|g|piece|pieces|ml|l)$/i);
        if (volumeMatch) {
          setVolumeValue(volumeMatch[1]);
          setVolumeUnit(volumeMatch[2].toLowerCase());
        }
      }
      // Parse expiry string (e.g., '2 days')
      if (editData.expiry && typeof editData.expiry === 'string') {
        const expiryMatch = editData.expiry.match(/^(\d+)\s*(hours|days)$/i);
        if (expiryMatch) {
          setExpiryValue(expiryMatch[1]);
          setExpiryUnit(expiryMatch[2].toLowerCase() as 'hours' | 'days');
        }
      }
      // Set image previews from editData.images if present
      if (editData.images && Array.isArray(editData.images)) {
        setImagePreviews(editData.images);
        setThumbnailIdx(editData.images.findIndex(img => img === editData.thumbnail) || 0);
      }
    }
  }, [editData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, organizationsRes] = await Promise.all([
          getCategories(),
          getOrganizations()
        ]);
  setCategories(categoriesRes.data as Category[]);
  setOrganizations(organizationsRes.data as Organization[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Update volumeOfMeasurement when volumeValue or volumeUnit changes
  useEffect(() => {
    if (volumeValue && volumeUnit) {
      setForm(prev => ({ ...prev, volumeOfMeasurement: `${volumeValue} ${volumeUnit}` }));
    }
  }, [volumeValue, volumeUnit]);

  // Update expiry when expiryValue or expiryUnit changes
  useEffect(() => {
    if (expiryValue && expiryUnit) {
      setForm(prev => ({ ...prev, expiry: `${expiryValue} ${expiryUnit}` }));
    } else {
      setForm(prev => ({ ...prev, expiry: '' }));
    }
  }, [expiryValue, expiryUnit]);

  // Generate barcode when SKU, price, or volume changes
  useEffect(() => {
    if (form.sku && form.price > 0 && volumeValue && volumeUnit) {
      console.log('Generating barcode with data:', { sku: form.sku, price: form.price, weight: `${volumeValue}${volumeUnit}`, type: barcodeType });
      
      const barcodeData: BarcodeData = {
        sku: form.sku,
        price: form.price,
        weight: `${volumeValue}${volumeUnit}`
      };
      
      const barcode = barcodeType === '12' 
        ? generateBarcodeNumber(barcodeData)
        : generateLongBarcodeNumber(barcodeData);
      
      console.log('Generated barcode:', barcode);
      setGeneratedBarcode(barcode);
      setForm(prev => ({ ...prev, barcode }));
    }
  }, [form.sku, form.price, volumeValue, volumeUnit, barcodeType]);

  const [fieldErrors, setFieldErrors] = React.useState({
    itemId: '',
    sku: '',
    categoryId: '',
    itemName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    let errorMsg = '';

    if (name === 'itemId' || name === 'sku' || name === 'categoryId') {
      if (/[^a-zA-Z0-9]/.test(value)) {
        errorMsg = 'Special characters not allowed';
        newValue = value.replace(/[^a-zA-Z0-9]/g, '');
      }
      setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
    if (name === 'itemName') {
      // Only allow alphabets and hyphen
      if (/[^a-zA-Z\-\s]/.test(value)) {
        errorMsg = 'Only alphabets and - allowed';
        newValue = value.replace(/[^a-zA-Z\-\s]/g, '');
      }
      setFieldErrors(prev => ({ ...prev, itemName: errorMsg }));
    }

    if (name === 'expiry') {
      // Only allow positive integers
      if (/^\d*$/.test(value)) {
        setExpiryValue(newValue);
      }
    } else if (name === 'expiryUnit') {
      setExpiryUnit(newValue as 'hours' | 'days');
    } else if (name.startsWith('nutritionValue.')) {
      const nutritionField = name.split('.')[1];
      setForm({
        ...form,
        nutritionValue: {
          ...form.nutritionValue,
          [nutritionField]: Number(newValue)
        }
      });
    } else {
      setForm({ ...form, [name]: newValue });
    }
  };

  // removed legacy handleFileChange (single image/thumbnail)

  const handleFilesSelected = async (fileList: FileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setNewImages(prev => [...prev, ...files]);
    // Precompute base64 for selection/payload
    const base64Arr: string[] = [];
    for (const f of files) {
      base64Arr.push(await fileToBase64(f));
    }
    setNewImagesBase64(prev => [...prev, ...base64Arr]);
    // Set default thumbnail if not set yet
    setThumbnail(prev => prev || existingImages[0] || base64Arr[0] || '');
  };

  const removeExistingImageAt = (index: number) => {
    setExistingImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      // If removed was thumbnail, pick next available
      if (thumbnail === prev[index]) {
        const fallback = next[0] || newImagesBase64[0] || '';
        setThumbnail(fallback);
      }
      return next;
    });
  };

  const removeNewImageAt = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagesBase64(prev => {
      const removed = prev[index];
      const next = prev.filter((_, i) => i !== index);
      if (thumbnail === removed) {
        const fallback = existingImages[0] || next[0] || '';
        setThumbnail(fallback);
      }
      return next;
    });
  };

  const handleVolumeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolumeValue(e.target.value);
  };

  const handleVolumeUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVolumeUnit(e.target.value);
  };

  const validateStep1 = () => {
    if (!form.itemName || !volumeValue || !volumeUnit || !form.categoryId || !form.organizationId) {
      setError('Please fill all required fields (Item Name, Volume Value, Volume Unit, Category, Organization)');
      return false;
    }
    if (!/^[a-zA-Z\-\s]+$/.test(form.itemName)) {
      setFieldErrors(prev => ({ ...prev, itemName: 'Only alphabets and - allowed' }));
      setError('Item Name can only contain alphabets and -');
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(form.categoryId)) {
      setFieldErrors(prev => ({ ...prev, categoryId: 'Special characters not allowed' }));
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (form.barcode && !/^\d{12}$/.test(form.barcode) && !/^\d{16}$/.test(form.barcode)) {
      setError('Barcode must be 12 or 16 digits');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      console.log('Submitting catalogue with files:', { existing: existingImages.length, new: newImages.length, thumbnail: !!thumbnail });

      // Prefer base64 payload so it works across machines without shared disk
      let payload: any = { ...form };
      // expiry is already a string in form state (e.g., '2 days' or '')
      const combinedImages: string[] = [...existingImages, ...newImagesBase64];
      if (combinedImages.length > 0) {
        payload.images = combinedImages;
        payload.image = combinedImages[0];
      } else {
        payload.images = [];
        payload.image = '';
      }
      if (thumbnail) payload.thumbnail = thumbnail;

      if (editId) {
        await updateCatalogue(editId, payload);
      } else {
        await createCatalogue(payload);
      }
      setForm(initialState);
      setExistingImages([]);
      setNewImages([]);
      setNewImagesBase64([]);
      setThumbnail('');
      setVolumeValue('');
      setVolumeUnit('');
      setExpiryValue('');
      setExpiryUnit('hours');
      setError('');
      onBack();
    } catch (error) {
      setError('Failed to save catalogue. Please try again.');
    }
  };

  return (
    <div style={{ padding: '32px 0', background: '#f8f9fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{editId ? 'Edit Catalogue' : 'Add Catalogue'}</h1>
        <div style={{ fontSize: 15, color: '#6c6c6c', marginBottom: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onBack}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>{'←'}</span> Back to Catalogue
        </div>
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #e6e6e6', padding: 40, maxWidth: 900, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Catalogue Information</div>
                {/* Item ID and SKU are autogenerated in backend, not shown in UI */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Item Name <span style={{ color: 'red' }}>*</span></label>
                    <input name="itemName" value={form.itemName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    {fieldErrors.itemName && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.itemName}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Category <span style={{ color: 'red' }}>*</span></label>
                    <select name="categoryId" value={form.categoryId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName} ({category.categoryId})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.categoryId && <div style={{ color: 'red', fontSize: 13 }}>{fieldErrors.categoryId}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                      <label>Volume of Measurement <span style={{ color: 'red' }}>*</span></label>
                      <input name="volumeValue" value={volumeValue} onChange={handleVolumeValueChange} required placeholder="Enter value" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label>&nbsp;</label>
                      <select name="volumeUnit" value={volumeUnit} onChange={handleVolumeUnitChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                        <option value="">Select unit</option>
                        <option value="kg">kg</option>
                        <option value="gm">gm</option>
                        <option value="piece">piece</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Source of Origin</label>
                    <input name="sourceOfOrigin" value={form.sourceOfOrigin} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Price <span style={{ color: 'red' }}>*</span></label>
                    <input name="price" type="number" value={form.price || ''} onChange={handleChange} required min="0" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Stock</label>
                    <input name="stock" type="number" value={form.stock || ''} onChange={handleChange} min="0" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Certification</label>
                    <input name="certification" value={form.certification} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Instructions</label>
                    <input name="instructions" value={form.instructions} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Status <span style={{ color: 'red' }}>*</span></label>
                    <select name="status" value={form.status} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Organization <span style={{ color: 'red' }}>*</span></label>
                    <select name="organizationId" value={form.organizationId || ''} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                      <option value="">Select an organization</option>
                      {organizations.map(org => (
                        <option key={org._id} value={org._id}>
                          {org.organizationName} ({org.organizationId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                      <label>Expiry</label>
                      <input name="expiry" type="number" value={expiryValue} onChange={handleChange} min="0" placeholder="Enter value" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label>&nbsp;</label>
                      <select name="expiryUnit" value={expiryUnit} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Nutrition Value Section */}
                <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: '#495057' }}>Nutrition Information (per 100g)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: 4 }}>Calories</label>
                      <input name="nutritionValue.calories" type="number" value={form.nutritionValue?.calories || ''} onChange={handleChange} placeholder="kcal" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: 4 }}>Protein (g)</label>
                      <input name="nutritionValue.protein" type="number" value={form.nutritionValue?.protein || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: 4 }}>Fat (g)</label>
                      <input name="nutritionValue.fat" type="number" value={form.nutritionValue?.fat || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: 4 }}>Carbs (g)</label>
                      <input name="nutritionValue.carbs" type="number" value={form.nutritionValue?.carbs || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: 4 }}>Sugar (g)</label>
                      <input name="nutritionValue.sugar" type="number" value={form.nutritionValue?.sugar || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: 4 }}>Sodium (mg)</label>
                      <input name="nutritionValue.sodium" type="number" value={form.nutritionValue?.sodium || ''} onChange={handleChange} placeholder="milligrams" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                    </div>
                  </div>
                </div>
                {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 32 }}>
                  <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); if (validateStep1()) setStep(2); }} style={{ background: '#6c3fc5', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, padding: '10px 32px', cursor: 'pointer' }}>Next</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Product Images</div>
                <div style={{ marginBottom: 16 }}>
                  <label>Upload Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      if (!e.target.files) return;
                      await handleFilesSelected(e.target.files);
                      // reset input so same files can be reselected if needed
                      e.currentTarget.value = '';
                    }}
                    style={{ display: 'block', marginTop: 4 }}
                  />
                </div>
                {/* Preview existing images */}
                {(existingImages.length > 0 || newImages.length > 0) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {existingImages.map((src, idx) => (
                      <div key={`exist-${idx}`} style={{ position: 'relative', border: thumbnail === src ? '2px solid #1976d2' : '1px solid #ccc', borderRadius: 6, padding: 2 }}>
                        <img
                          alt={`image-${idx}`}
                          src={src}
                          style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', borderRadius: 4, cursor: 'pointer' }}
                          onClick={() => setThumbnail(src)}
                        />
                        {thumbnail === src && (
                          <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, background: 'rgba(25,118,210,0.85)', color: '#fff', fontSize: 10, textAlign: 'center', borderRadius: 4 }}>Thumbnail</div>
                        )}
                        <button type="button" onClick={() => removeExistingImageAt(idx)} style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#ff4d4f', color: '#fff', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                    {newImages.map((f, idx) => (
                      <div key={`new-${idx}`} style={{ position: 'relative', border: thumbnail === newImagesBase64[idx] ? '2px solid #1976d2' : '1px solid #ccc', borderRadius: 6, padding: 2 }}>
                        <img
                          alt={f.name}
                          src={URL.createObjectURL(f)}
                          style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', borderRadius: 4, cursor: 'pointer' }}
                          onClick={() => setThumbnail(newImagesBase64[idx])}
                        />
                        {thumbnail === newImagesBase64[idx] && (
                          <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, background: 'rgba(25,118,210,0.85)', color: '#fff', fontSize: 10, textAlign: 'center', borderRadius: 4 }}>Thumbnail</div>
                        )}
                        <button type="button" onClick={() => removeNewImageAt(idx)} style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#ff4d4f', color: '#fff', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Barcode Generation Section */}
                <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: '#495057' }}>Product Barcode</div>
                  
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label>Barcode Type</label>
                      <select 
                        value={barcodeType} 
                        onChange={(e) => setBarcodeType(e.target.value as '12' | '16')}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}
                      >
                        <option value="12">12-Digit Barcode</option>
                        <option value="16">16-Digit Barcode</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Generated Barcode</label>
                      <input 
                        name="barcode" 
                        value={form.barcode} 
                        readOnly
                        style={{ 
                          width: '100%', 
                          padding: 10, 
                          borderRadius: 6, 
                          border: '1px solid #ccc', 
                          marginTop: 4,
                          backgroundColor: '#f8f9fa',
                          fontFamily: 'monospace',
                          fontSize: '14px'
                        }} 
                      />
                    </div>
                  </div>
                  
                  {!form.barcode && form.sku && form.price > 0 && volumeValue && volumeUnit && (
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const barcodeData: BarcodeData = {
                            sku: form.sku,
                            price: form.price,
                            weight: `${volumeValue}${volumeUnit}`
                          };
                          
                          const barcode = barcodeType === '12' 
                            ? generateBarcodeNumber(barcodeData)
                            : generateLongBarcodeNumber(barcodeData);
                          
                          setGeneratedBarcode(barcode);
                          setForm(prev => ({ ...prev, barcode }));
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Generate Barcode
                      </button>
                    </div>
                  )}
                  
                  {generatedBarcode && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                        Barcode Preview
                      </div>
                      <BarcodeDisplay 
                        barcodeNumber={generatedBarcode}
                        width={2}
                        height={80}
                        showText={true}
                        format="CODE128"
                      />
                    </div>
                  )}
                  
                  <div style={{ marginTop: 12, fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
                    Barcode is automatically generated from SKU, Price, and Volume information
                  </div>
                </div>
                {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 32 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Previous</button>
                  <button type="submit" style={{ background: '#6c3fc5', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, padding: '10px 32px', cursor: 'pointer' }}>{editId ? 'Update Catalogue' : 'Upload Catalogue'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCataloguePage;
