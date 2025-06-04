import React, { useState } from 'react';
import { type FieldType } from '@/types';

type DynamicFormProps = {
  schema: FieldType[];
  onSubmit: (formData: Record<string, any>) => void;
};

const DynamicForm: React.FC<DynamicFormProps> = ({ schema, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, type, value, checked, files } = e.target;

    if (type === 'checkbox' && Array.isArray(formData[name])) {
      const updated = checked
        ? [...formData[name], value]
        : formData[name].filter((v: string) => v !== value);
      setFormData({ ...formData, [name]: updated });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {schema.map(field => (
        <div key={field.name} className="flex flex-col">
          <label className="mb-1 font-semibold">{field.label}</label>

          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              required={field.required}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              required={field.required}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">Select...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === 'radio' ? (
            field.options?.map(opt => (
              <label key={opt} className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.name}
                  value={opt}
                  onChange={handleChange}
                  required={field.required}
                />
                <span>{opt}</span>
              </label>
            ))
          ) : field.type === 'checkbox' && field.options ? (
            field.options.map(opt => (
              <label key={opt} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={field.name}
                  value={opt}
                  onChange={handleChange}
                  checked={formData[field.name]?.includes?.(opt) || false}
                />
                <span>{opt}</span>
              </label>
            ))
          ) : (
            <input
              type={field.type}
              name={field.name}
              required={field.required}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          )}
        </div>
      ))}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
};

export default DynamicForm;
