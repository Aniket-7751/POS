
import React, { useState, useEffect } from 'react';
import { createCatalogue, updateCatalogue, buildFormData, fileToBase64 } from './catalogueApi';
import { getCategories } from '../category/categoryApi';
import { getOrganizations } from '../../organization/organizationApi';
import { compressImage } from '../../../utils/imageCompression';
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
  thumbnail: '',
  instructions: '',
  expiry: 0,
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
  const [image, setImage] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [volumeValue, setVolumeValue] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('');

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
    }
  }, [editData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, organizationsRes] = await Promise.all([
          getCategories(),
          getOrganizations()
        ]);
        setCategories(categoriesRes.data);
        setOrganizations(organizationsRes.data);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'expiry' || name === 'price' || name === 'stock') {
      setForm({ ...form, [name]: Number(value) });
    } else if (name.startsWith('nutritionValue.')) {
      const nutritionField = name.split('.')[1];
      setForm({ 
        ...form, 
        nutritionValue: { 
          ...form.nutritionValue, 
          [nutritionField]: Number(value) 
        } 
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'thumbnail') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`File selected for ${type}:`, file.name, file.size, file.type);
      if (type === 'image') setImage(file);
      else setThumbnail(file);
    }
  };

  const handleVolumeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolumeValue(e.target.value);
  };

  const handleVolumeUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVolumeUnit(e.target.value);
  };

  const validateStep1 = () => {
    if (!form.sku || !form.itemName || !volumeValue || !volumeUnit || !form.categoryId || !form.organizationId) {
      setError('Please fill all required fields (SKU, Item Name, Volume Value, Volume Unit, Category, Organization)');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (form.barcode && !/^\d{12}$/.test(form.barcode)) {
      setError('Barcode must be 12 digits');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      console.log('Submitting catalogue with files:', { image: !!image, thumbnail: !!thumbnail });

      // Prefer base64 payload so it works across machines without shared disk
      let payload: any = { ...form };
      if (image) {
        payload.image = await fileToBase64(image);
      }
      if (thumbnail) {
        payload.thumbnail = await fileToBase64(thumbnail);
      }

      if (editId) {
        console.log('Updating catalogue with base64 (if provided)...');
        await updateCatalogue(editId, payload);
      } else {
        console.log('Creating catalogue with base64 (if provided)...');
        await createCatalogue(payload);
      }
      
      console.log('Catalogue saved successfully, calling onBack...');
      setForm(initialState);
      setImage(null);
      setThumbnail(null);
      setVolumeValue('');
      setVolumeUnit('');
      setError('');
      onBack();
    } catch (error) {
      console.error('Error saving catalogue:', error);
      setError('Failed to save catalogue. Please try again.');
    }
  };

  return (
    <div style={{ padding: '32px 0', background: '#f8f9fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 15, color: '#6c6c6c', marginBottom: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={onBack}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>{'←'}</span> Back to Catalogue
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>{editId ? 'Edit Catalogue' : 'Add Catalogue'}</h1>
        <div style={{ color: '#6c6c6c', marginBottom: 32 }}>{editId ? 'Edit the catalogue details' : 'Add a new catalogue item to your inventory'}</div>
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #e6e6e6', padding: 40, maxWidth: 900, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Catalogue Information</div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Item ID *</label>
                    <input name="itemId" value={form.itemId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>SKU *</label>
                    <input name="sku" value={form.sku} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Item Name *</label>
                    <input name="itemName" value={form.itemName} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Category *</label>
                    <select name="categoryId" value={form.categoryId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName} ({category.categoryId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Volume of Measurement *</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <input 
                        name="volumeValue" 
                        value={volumeValue} 
                        onChange={handleVolumeValueChange} 
                        required 
                        placeholder="Enter value" 
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc' }} 
                      />
                      <select 
                        name="volumeUnit" 
                        value={volumeUnit} 
                        onChange={handleVolumeUnitChange} 
                        required 
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                      >
                        <option value="">Select unit</option>
                        <option value="kg">kg</option>
                        <option value="gm">gm</option>
                        <option value="piece">piece</option>
                        <option value="pieces">pieces</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Source of Origin</label>
                    <input name="sourceOfOrigin" value={form.sourceOfOrigin} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Price *</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Stock</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Certification</label>
                  <input name="certification" value={form.certification} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Instructions</label>
                  <input name="instructions" value={form.instructions} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                </div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Status *</label>
                    <select name="status" value={form.status} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Organization *</label>
                    <select name="organizationId" value={form.organizationId || ''} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }}>
                      <option value="">Select an organization</option>
                      {organizations.map(org => (
                        <option key={org._id} value={org._id}>
                          {org.organizationName} ({org.organizationId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Expiry (in hours)</label>
                  <input name="expiry" type="number" value={form.expiry} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                </div>
                
                {/* Nutrition Value Section */}
                <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: '#495057' }}>Nutrition Information (per 100g)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 26 }}>
                    <div>
                      <label>Calories</label>
                      <input name="nutritionValue.calories" type="number" value={form.nutritionValue?.calories || ''} onChange={handleChange} placeholder="kcal" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                    <div>
                      <label>Protein (g)</label>
                      <input name="nutritionValue.protein" type="number" value={form.nutritionValue?.protein || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                    <div>
                      <label>Fat (g)</label>
                      <input name="nutritionValue.fat" type="number" value={form.nutritionValue?.fat || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 26 }}>
                    <div>
                      <label>Carbs (g)</label>
                      <input name="nutritionValue.carbs" type="number" value={form.nutritionValue?.carbs || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                    <div>
                      <label>Fiber (g)</label>
                      <input name="nutritionValue.fiber" type="number" value={form.nutritionValue?.fiber || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                    <div>
                      <label>Sugar (g)</label>
                      <input name="nutritionValue.sugar" type="number" value={form.nutritionValue?.sugar || ''} onChange={handleChange} placeholder="grams" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                    <div>
                      <label>Sodium (mg)</label>
                      <input name="nutritionValue.sodium" type="number" value={form.nutritionValue?.sodium || ''} onChange={handleChange} placeholder="milligrams" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                    </div>
                  </div>
                </div>
                {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 32 }}>
                  <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={() => { if (validateStep1()) setStep(2); }} style={{ background: '#6c3fc5', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, padding: '10px 32px', cursor: 'pointer' }}>Next</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Product Information</div>
                <div style={{ marginBottom: 16 }}>
                  <label>Upload Image</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} style={{ display: 'block', marginTop: 4 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Upload Thumbnail Image</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'thumbnail')} style={{ display: 'block', marginTop: 4 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Barcode (12 digits)</label>
                  <input name="barcode" value={form.barcode} onChange={handleChange} required maxLength={12} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                </div>
                {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 32 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6c3fc5', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Previous</button>
                  <button type="submit" style={{ background: '#6c3fc5', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, padding: '10px 32px', cursor: 'pointer' }}>{editId ? 'Update' : 'Upload'}</button>
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
