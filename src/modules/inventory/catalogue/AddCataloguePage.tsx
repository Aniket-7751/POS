
import React, { useState, useEffect } from 'react';
import { createCatalogue, updateCatalogue } from './catalogueApi';
import { Catalogue } from './types';

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

  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

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
      if (type === 'image') setImage(e.target.files[0]);
      else setThumbnail(e.target.files[0]);
    }
  };

  const validateStep1 = () => {
    if (!form.sku || !form.itemName || !form.volumeOfMeasurement || !form.categoryId || !form.organizationId) {
      setError('Please fill all required fields (SKU, Item Name, Volume, Category ID, Organization ID)');
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
    if (editId) {
      await updateCatalogue(editId, form);
    } else {
      await createCatalogue(form);
    }
    setForm(initialState);
    onBack();
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
                    <label>Category ID *</label>
                    <input name="categoryId" value={form.categoryId} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Volume of Measurement *</label>
                    <input name="volumeOfMeasurement" value={form.volumeOfMeasurement} onChange={handleChange} required placeholder="e.g., 1kg, 500ml, 1 piece" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
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
                    <label>Stock *</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
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
                    <label>Organization ID *</label>
                    <input name="organizationId" value={form.organizationId || ''} onChange={handleChange} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
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
