export type SelectOption = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export const ALL_OPTION: SelectOption = {
  value: '',
  label: 'All',
};

export const withAllOption = (input: {
  options: SelectOption[];
  label?: string;
  value?: string;
}) => {
  const { options, label = ALL_OPTION.label, value = ALL_OPTION.value } = input;
  return [
    {
      value,
      label,
    },
    ...options,
  ];
};
