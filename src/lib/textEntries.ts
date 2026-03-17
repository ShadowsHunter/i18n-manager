// Text entry data types
export interface TextEntry {
  uuid: string;
  cn?: string;
  da?: string;
  de?: string;
  en?: string;
  es?: string;
  fi?: string;
  fr?: string;
  it?: string;
  nl?: string;
  no?: string;
  pl?: string;
  se?: string;
  context?: string;
}

// Initial mock data
export const mockTextEntries: TextEntry[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    cn: '确定',
    en: 'OK',
    de: 'OK',
    es: 'Aceptar',
    fi: 'OK',
    fr: 'Valider',
    it: 'OK',
    nl: 'OK',
    no: 'OK',
    pl: 'OK',
    se: 'OK',
  },
  {
    uuid: '6ba7b810-9dad-11d1-80b7-44d45553535000',
    cn: '取消',
    en: 'Cancel',
    de: 'Abbrechen',
    es: 'Cancelar',
    fi: 'Peruuta',
    fr: 'Annuler',
    it: 'Annulla',
    nl: 'Annuleren',
    no: 'Avbryt',
    pl: 'Anuluj',
    se: 'Avbryt',
  },
  {
    uuid: '9b1deb4d-3b7d-4b77-c9df-08e8-77f1ef',
    cn: '设置',
    en: 'Settings',
    de: 'Einstellungen',
    es: 'Configuración',
    fi: 'Asetukset',
    fr: 'Paramètres',
    it: 'Impostazioni',
    nl: 'Instellingen',
    no: 'Innstillinger',
    pl: 'Ustawienia',
    se: 'Inställningar',
  },
];
