import React, { useState, useRef, useEffect } from 'react';
import { TimeRangePicker } from '@/components/ui/timeRangePicker';
import { type FieldType as BaseFieldType } from '@/types';

// Extend FieldType to include 'fields', 'minItems', and 'maxItems' for array type
type FieldType = BaseFieldType & {
  fields?: BaseFieldType[];
  minItems?: number;
  maxItems?: number;
  section?: string;
};
import { parse } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

type DynamicFormProps = {
  schema: FieldType[];
  onSubmit: (formData: Record<string, any>) => void;
  submitButtonText?: string;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  disabled?: boolean;
  onChange?: (formData: Record<string, any>) => void; // <-- Add this line
};

function parseTimeRangeString(str: string): { start?: Date; end?: Date } {
  if (!str || typeof str !== 'string') return {};
  const [startStr, endStr] = str.split(' - ');
  if (!startStr || !endStr) return {};
  // Use today's date for both, only time matters
  const today = new Date();
  const parseTime = (s: string) => parse(s, 'hh:mma', today);
  return {
    start: parseTime(startStr.trim()),
    end: parseTime(endStr.trim()),
  };
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  onCancel,
  defaultValues,
  submitButtonText = 'Submit',
  disabled,
  onChange, // <-- Add this line
}) => {
  // If editing and timerange, convert string to {start, end} for picker
  const initialFormData = { ...(defaultValues || {}) };
  schema.forEach(field => {
    if (
      field.type === 'timerange' &&
      initialFormData[field.name] &&
      typeof initialFormData[field.name] === 'string'
    ) {
      initialFormData[field.name] = parseTimeRangeString(initialFormData[field.name]);
    }
  });

  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // For array fields, initialize state for each array field
  const [arrayFieldData, setArrayFieldData] = useState<Record<string, any[]>>(() => {
    const initial: Record<string, any[]> = {};
    schema.forEach(field => {
      if (field.type === 'array') {
        initial[field.name] =
          defaultValues?.[field.name] && Array.isArray(defaultValues[field.name])
            ? defaultValues[field.name]
            : [field.fields?.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})];
      }
    });
    return initial;
  });

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

  // Update formData and call onChange if provided
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, type, value, checked, files, multiple, options } = e.target;

    let updatedFormData: Record<string, any>;
    if (type === 'checkbox' && Array.isArray(formData[name])) {
      const updated = checked
        ? [...formData[name], value]
        : formData[name].filter((v: string) => v !== value);
      updatedFormData = { ...formData, [name]: updated };
    } else if (type === 'checkbox') {
      updatedFormData = { ...formData, [name]: checked };
    } else if (type === 'file') {
      updatedFormData = { ...formData, [name]: files[0] };
    } else if (multiple) {
      const selectedValues = Array.from(options)
        .filter(option => (option as HTMLOptionElement).selected)
        .map(option => (option as HTMLOptionElement).value);
      updatedFormData = { ...formData, [name]: selectedValues };
    } else {
      updatedFormData = { ...formData, [name]: value };
    }
    setFormData(updatedFormData);
    if (onChange) onChange(updatedFormData); // <-- Call onChange if provided
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

  const handleArrayFieldChange = (fieldName: string, idx: number, subField: string, value: any) => {
    setArrayFieldData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) =>
        i === idx ? { ...item, [subField]: value } : item
      ),
    }));
  };

  const handleAddArrayFieldItem = (fieldName: string, fields: FieldType[]) => {
    setArrayFieldData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})],
    }));
  };

  const handleRemoveArrayFieldItem = (fieldName: string, idx: number) => {
    setArrayFieldData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    // Add array fields to finalData
    Object.keys(arrayFieldData).forEach(fieldName => {
      finalData[fieldName] = arrayFieldData[fieldName];
    });
    onSubmit(finalData);
  };

  // Also call onChange when arrayFieldData changes
  useEffect(() => {
    if (onChange) {
      const merged = { ...formData };
      Object.keys(arrayFieldData).forEach(fieldName => {
        merged[fieldName] = arrayFieldData[fieldName];
      });
      onChange(merged);
    }
  }, [arrayFieldData]);

  // Call onChange with defaultValues on mount
  useEffect(() => {
    if (onChange) {
      onChange(defaultValues || {});
    }
  }, []);

  // Update formData when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues);
    }
  }, [defaultValues]); // <- Now it updates when formValues changes

  // Group fields by section
  const sectionMap: Record<string, FieldType[]> = {};
  schema.forEach(field => {
    const section = field.section || 'General';
    if (!sectionMap[section]) sectionMap[section] = [];
    sectionMap[section].push(field);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8 mx-auto max-w-5xl w-full">
      {Object.entries(sectionMap).map(([section, fields]) => (
        <div key={section} className="mb-8">
          {section !== 'General' && <h2 className="text-lg font-semibold mb-4">{section}</h2>}
          {/* Render fields in this section as before */}
          {(() => {
            // Build rows for this section
            const rows: FieldType[][] = [];
            let currentRow: FieldType[] = [];
            let currentColCount = 0;
            fields.forEach(field => {
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

            return rows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {row.map(field => (
                  <div
                    key={field.name}
                    className={`flex flex-col ${field.columns === 2 ? 'md:col-span-2' : 'md:col-span-1'}`}
                  >
                    <label className="mb-1">{field.label}</label>
                    {field.type === 'array' && field.fields ? (
                      <div className="mb-6 mt-2">
                        {arrayFieldData[field.name]?.map((item, idx) => (
                          <div key={idx} className="flex gap-2 mb-2 items-center">
                            {field.fields?.map(subField =>
                              subField.type === 'select' ? (
                                <select
                                  key={subField.name}
                                  className="border p-2 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                  value={item[subField.name]}
                                  onChange={e =>
                                    handleArrayFieldChange(
                                      field.name,
                                      idx,
                                      subField.name,
                                      e.target.value
                                    )
                                  }
                                  required={subField.required}
                                  disabled={disabled}
                                >
                                  <option value="">Select...</option>
                                  {subField.options?.map(opt => {
                                    const optionValue = typeof opt === 'string' ? opt : opt.value;
                                    const optionLabel = typeof opt === 'string' ? opt : opt.label;
                                    return (
                                      <option key={optionValue} value={optionValue}>
                                        {optionLabel}
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <input
                                  key={subField.name}
                                  type={subField.type}
                                  placeholder={subField.label}
                                  className="border p-2 rounded-md flex-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                  value={item[subField.name]}
                                  onChange={e =>
                                    handleArrayFieldChange(
                                      field.name,
                                      idx,
                                      subField.name,
                                      e.target.value
                                    )
                                  }
                                  required={subField.required}
                                  disabled={disabled}
                                />
                              )
                            )}
                            {arrayFieldData[field.name].length > (field.minItems || 1) && (
                              <Trash2
                                className="text-red-500 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 rounded p-1"
                                size={24}
                                onClick={() => handleRemoveArrayFieldItem(field.name, idx)}
                                style={{ minWidth: 24, minHeight: 24 }}
                                aria-label="Remove"
                                tabIndex={0}
                                role="button"
                              />
                            )}
                            <Plus
                              className="rounded cursor-pointer h-9 w-9 p-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleAddArrayFieldItem(field.name, field.fields!)}
                              aria-label={`Add ${field.label}`}
                              tabIndex={0}
                              role="button"
                            />
                          </div>
                        ))}
                      </div>
                    ) : field.type === 'timerange' ? (
                      <TimeRangePicker
                        value={formData[field.name]}
                        onChange={range => {
                          setFormData({
                            ...formData,
                            [field.name]: range,
                          });
                        }}
                        placeholder="Select time range"
                      />
                    ) : field.type === 'toggle' ? (
                      <label className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={formData[field.name]}
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none ${
                            formData[field.name] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          onClick={() =>
                            setFormData({ ...formData, [field.name]: !formData[field.name] })
                          }
                          disabled={disabled || field.disabled}
                        >
                          <span
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                              formData[field.name] ? 'translate-x-6' : ''
                            }`}
                          />
                        </button>
                        <span
                          className={`text-sm font-medium ${
                            formData[field.name]
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {formData[field.name] ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        required={field.required}
                        placeholder={field.placeholder}
                        onChange={handleChange}
                        className="border p-2 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
                          className="w-full border p-2 mb-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white flex justify-between items-center text-left"
                        >
                          <span
                            className={`${!formData[field.name]?.length ? 'text-gray-500 dark:text-gray-400' : ''}`}
                          >
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
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                            {field.options?.map(opt => {
                              const optionValue = typeof opt === 'string' ? opt : opt.value;
                              const optionLabel = typeof opt === 'string' ? opt : opt.label;
                              const isSelected =
                                Array.isArray(formData[field.name]) &&
                                formData[field.name].map(String).includes(String(optionValue));

                              return (
                                <div
                                  key={optionValue}
                                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                                    isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''
                                  }`}
                                  onClick={() => handleMultiSelectToggle(field.name, optionValue)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // Handled by parent onClick
                                    className="w-4 h-4"
                                  />
                                  <span
                                    className={`dark:text-white ${isSelected ? 'font-medium text-blue-700 dark:text-blue-300' : ''}`}
                                  >
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
                              const label =
                                typeof option === 'string' ? option : option?.label || val;
                              return (
                                <span
                                  key={val}
                                  className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700"
                                >
                                  {label}
                                  <button
                                    type="button"
                                    className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none"
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
                        className="border p-2 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
                                className="bg-primary mb-2 checked:bg-accent"
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
                                className="mb-2"
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
                        className="border p-2 rounded-md focus:outline-none focus:ring-2 mb-2 focus:ring-black dark:focus:ring-white px-3 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={formData[field.name] ?? ''}
                        disabled={disabled || field.disabled}
                      />
                    )}
                  </div>
                ))}
              </div>
            ));
          })()}
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

export { DynamicForm };
