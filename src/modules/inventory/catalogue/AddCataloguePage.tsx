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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [thumbnailIdx, setThumbnailIdx] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [volumeValue, setVolumeValue] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('');
  const [barcodeType, setBarcodeType] = useState<'12' | '16'>('12');
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [expiryValue, setExpiryValue] = useState('');
  const [expiryUnit, setExpiryUnit] = useState<'hours' | 'days'>('hours');

  useEffect(() => {
    if (editData) {
      setForm(editData);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'thumbnail') => {
    if (type === 'image' && e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      // Generate previews
      Promise.all(files.map(file => fileToBase64(file))).then(previews => {
        setImagePreviews(previews);
      });
      setThumbnailIdx(0); // Default to first image
    }
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
      let payload: any = { ...form };
      // expiry is already a string in form state (e.g., '2 days' or '')
      if (images.length > 0) {
        // Compress and convert all images to base64
        const base64Images = await Promise.all(images.map(file => fileToBase64(file)));
        payload.images = base64Images;
        payload.thumbnail = base64Images[thumbnailIdx] || base64Images[0];
      } else if (imagePreviews.length > 0) {
        payload.images = imagePreviews;
        payload.thumbnail = imagePreviews[thumbnailIdx] || imagePreviews[0];
      }
      if (editId) {
        await updateCatalogue(editId, payload);
      } else {
        await createCatalogue(payload);
      }
      setForm(initialState);
      setImages([]);
      setImagePreviews([]);
      setThumbnailIdx(0);
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
                  <label>Upload Images (multiple allowed, max 5)</label>
                  <input type="file" accept="image/*" multiple onChange={e => handleFileChange(e, 'image')} style={{ display: 'block', marginTop: 4 }} />
                  <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                    {imagePreviews.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={img} alt={`Preview ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: idx === thumbnailIdx ? '2px solid #6c3fc5' : '1px solid #ccc' }} />
                        <button type="button" onClick={() => setThumbnailIdx(idx)} style={{ position: 'absolute', top: 4, right: 4, background: idx === thumbnailIdx ? '#6c3fc5' : '#fff', color: idx === thumbnailIdx ? '#fff' : '#6c3fc5', border: '1px solid #6c3fc5', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Set as thumbnail">{idx === thumbnailIdx ? '✓' : '○'}</button>
                      </div>
                    ))}
                  </div>
                  {imagePreviews.length > 0 && <div style={{ marginTop: 8, fontSize: 13, color: '#6c3fc5' }}>Select one image as thumbnail</div>}
                </div>
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
