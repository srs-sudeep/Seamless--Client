import React, { useState } from 'react';
import { type FieldType } from '@/types';

type DynamicFormProps = {
  schema: FieldType[];
  onSubmit: (formData: Record<string, any>) => void;
  submitButtonText?: string;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  onCancel,
  defaultValues,
  submitButtonText = 'Submit',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues || {});

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

  const rows: FieldType[][] = [];
  let currentRow: FieldType[] = [];
  let currentColCount = 0;

  schema.forEach(field => {
    const col = field.columns || 1;
    if (currentColCount + col > 2) {
      rows.push(currentRow);
      currentRow = [field];
      currentColCount = col;
    } else {
      currentRow.push(field);
      currentColCount += col;
    }
  });

  if (currentRow.length > 0) rows.push(currentRow);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mx-auto max-w-5xl w-full">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {row.map(field => (
            <div
              key={field.name}
              className={`flex flex-col ${field.columns === 2 ? 'md:col-span-2' : 'md:col-span-1'}`}
            >
              <label className="mb-1">{field.label}</label>

              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3"
                  value={formData[field.name] || ''}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  required={field.required}
                  onChange={handleChange}
                  className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3"
                  value={formData[field.name] || ''}
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'radio' ? (
                <div className="flex flex-wrap gap-4">
                  {field.options?.map(opt => (
                    <label key={opt} className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name={field.name}
                        value={opt}
                        onChange={handleChange}
                        required={field.required}
                        className="bg-primary checked:bg-accent"
                        checked={formData[field.name] === opt}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : field.type === 'checkbox' && field.options ? (
                <div className="flex flex-wrap gap-4">
                  {field.options.map(opt => (
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
                  ))}
                </div>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3"
                  value={formData[field.name] || ''}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="flex justify-end gap-2 mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-primary transition-colors text-accent text-sm font-semibold px-4 py-2 rounded-md shadow-md"
        >
          {submitButtonText || 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
