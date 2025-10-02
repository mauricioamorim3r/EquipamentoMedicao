import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const languageOptions = [
  { code: 'pt-BR' as const, name: 'Português', flag: '🇧🇷' },
  { code: 'en-US' as const, name: 'English', flag: '🇺🇸' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languageOptions.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={`flex items-center justify-between cursor-pointer ${
              language === option.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{option.flag}</span>
              <span className="text-sm">{option.name}</span>
            </span>
            {language === option.code && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};