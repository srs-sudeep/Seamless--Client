import React, { useState, useRef, useEffect } from 'react';
import { type FieldType } from '@/types';

type DynamicFormProps = {
  schema: FieldType[];
  onSubmit: (formData: Record<string, any>) => void;
  submitButtonText?: string;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  disabled?: boolean;
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  onCancel,
  defaultValues,
  submitButtonText = 'Submit',
  disabled,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues || {});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach(fieldName => {
        if (
          openDropdowns[fieldName] &&
          dropdownRefs.current[fieldName] &&
          !dropdownRefs.current[fieldName]?.contains(event.target as Node)
        ) {
          setOpenDropdowns(prev => ({ ...prev, [fieldName]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdowns]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, type, value, checked, files, multiple, options } = e.target;

    if (type === 'checkbox' && Array.isArray(formData[name])) {
      const updated = checked
        ? [...formData[name], value]
        : formData[name].filter((v: string) => v !== value);
      setFormData({ ...formData, [name]: updated });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (multiple) {
      const selectedValues = Array.from(options)
        .filter(option => (option as HTMLOptionElement).selected)
        .map(option => (option as HTMLOptionElement).value);
      setFormData({ ...formData, [name]: selectedValues });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMultiSelectToggle = (fieldName: string, optionValue: string) => {
    const currentValues = Array.isArray(formData[fieldName]) ? formData[fieldName] : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v: string) => v !== optionValue)
      : [...currentValues, optionValue];

    setFormData({ ...formData, [fieldName]: newValues });
  };

  const toggleDropdown = (fieldName: string) => {
    setOpenDropdowns(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const getSelectedLabel = (field: FieldType) => {
    const selectedValues = Array.isArray(formData[field.name]) ? formData[field.name] : [];
    if (selectedValues.length === 0) return 'Select options...';
    if (selectedValues.length === 1) {
      const option = field.options?.find(
        opt => (typeof opt === 'string' ? opt : opt.value) === selectedValues[0]
      );
      return typeof option === 'string' ? option : option?.label || selectedValues[0];
    }
    return `${selectedValues.length} options selected`;
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

              {field.type === 'toggle' ? (
                <label className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      formData[field.name] ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, [field.name]: !formData[field.name] })
                    }
                    disabled={disabled || field.disabled}
                    aria-pressed={!!formData[field.name]}
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        formData[field.name] ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                  <span className="ml-2 text-sm">
                    {formData[field.name] ? 'Active' : 'Inactive'}
                  </span>
                </label>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3"
                  value={formData[field.name] || ''}
                  disabled={disabled || field.disabled}
                />
              ) : field.type === 'select' && field.multiSelect ? (
                <div
                  className="relative"
                  ref={el => {
                    dropdownRefs.current[field.name] = el;
                  }}
                >
                  {/* Custom Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => toggleDropdown(field.name)}
                    disabled={disabled || field.disabled}
                    className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3 bg-white flex justify-between items-center text-left"
                  >
                    <span className={`${!formData[field.name]?.length ? 'text-gray-500' : ''}`}>
                      {getSelectedLabel(field)}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${openDropdowns[field.name] ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Options */}
                  {openDropdowns[field.name] && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {field.options?.map(opt => {
                        const optionValue = typeof opt === 'string' ? opt : opt.value;
                        const optionLabel = typeof opt === 'string' ? opt : opt.label;
                        const isSelected =
                          Array.isArray(formData[field.name]) &&
                          formData[field.name].map(String).includes(String(optionValue));

                        return (
                          <div
                            key={optionValue}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleMultiSelectToggle(field.name, optionValue)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by parent onClick
                              className="w-4 h-4"
                            />
                            <span className={isSelected ? 'font-medium text-blue-700' : ''}>
                              {optionLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Options Chips */}
                  {Array.isArray(formData[field.name]) && formData[field.name].length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData[field.name].map((val: string) => {
                        const option = field.options?.find(
                          (opt: any) =>
                            String(typeof opt === 'string' ? opt : opt.value) === String(val)
                        );
                        const label = typeof option === 'string' ? option : option?.label || val;
                        return (
                          <span
                            key={val}
                            className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full border border-blue-200"
                          >
                            {label}
                            <button
                              type="button"
                              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                              onClick={() => handleMultiSelectToggle(field.name, val)}
                              aria-label="Remove"
                              tabIndex={0}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  required={field.required}
                  onChange={handleChange}
                  className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3"
                  value={formData[field.name] || ''}
                  disabled={disabled || field.disabled}
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => {
                    const optionValue = typeof opt === 'string' ? opt : opt.value;
                    const optionLabel = typeof opt === 'string' ? opt : opt.label;
                    return (
                      <option key={optionValue} value={optionValue}>
                        {optionLabel}
                      </option>
                    );
                  })}
                </select>
              ) : field.type === 'radio' ? (
                <div className="flex flex-wrap gap-4">
                  {field.options?.map(opt => {
                    const optionValue = typeof opt === 'string' ? opt : opt.value;
                    const optionLabel = typeof opt === 'string' ? opt : opt.label;
                    return (
                      <label key={optionValue} className="inline-flex items-center space-x-2">
                        <input
                          type="radio"
                          name={field.name}
                          value={optionValue}
                          onChange={handleChange}
                          required={field.required}
                          className="bg-primary checked:bg-accent"
                          checked={formData[field.name] === optionValue}
                          disabled={disabled || field.disabled}
                        />
                        <span>{optionLabel}</span>
                      </label>
                    );
                  })}
                </div>
              ) : field.type === 'checkbox' && field.options ? (
                <div className="flex flex-wrap gap-4">
                  {field.options.map(opt => {
                    const optionValue = typeof opt === 'string' ? opt : opt.value;
                    const optionLabel = typeof opt === 'string' ? opt : opt.label;
                    return (
                      <label key={optionValue} className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name={field.name}
                          value={optionValue}
                          onChange={handleChange}
                          checked={formData[field.name]?.includes?.(optionValue) || false}
                          disabled={disabled || field.disabled}
                        />
                        <span>{optionLabel}</span>
                      </label>
                    );
                  })}
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
                  disabled={disabled || field.disabled}
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
            disabled={disabled}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-primary transition-colors text-accent text-sm font-semibold px-4 py-2 rounded-md shadow-md"
          disabled={disabled}
        >
          {submitButtonText || 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
