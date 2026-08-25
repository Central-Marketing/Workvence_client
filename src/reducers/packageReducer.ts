import { PackageTiers, PricingTierDetails } from "@/types";

export interface PackageFormFaq {
  question: string;
  answer: string;
}

export interface PackageFormState {
  userID: string;
  title: string;
  category: string;
  cover: string;
  images: string[];
  description: string;
  shortTitle: string;
  shortDesc: string;
  deliveryTime: string | number;
  revisionNumber: string | number;
  features: string[];
  faqs: PackageFormFaq[];
  price: number;
  packages: {
    basic: PricingTierDetails;
    standard: PricingTierDetails | null;
    premium: PricingTierDetails | null;
    [key: string]: PricingTierDetails | null | undefined;
  };
}

export const initialState: PackageFormState = {
  userID: '',
  title: '',
  category: '',
  cover: '',
  images: [],
  description: '',
  shortTitle: '',
  shortDesc: '',
  deliveryTime: '',
  revisionNumber: '',
  features: [],
  faqs: [],
  price: 0,
  packages: {
    basic: {
      title: '',
      shortDesc: '',
      price: 0,
      deliveryTime: '',
      revisionNumber: '',
      features: []
    },
    standard: null,
    premium: null
  }
};

export type PackageAction =
  | { type: 'CHANGE_INPUT'; payload: { name: string; value: any } }
  | { type: 'ADD_IMAGES'; payload: { cover: string; images: string[] } }
  | { type: 'ADD_FEATURE'; payload: string }
  | { type: 'REMOVE_FEATURE'; payload: string }
  | { type: 'ADD_FAQ'; payload: PackageFormFaq }
  | { type: 'REMOVE_FAQ'; payload: number }
  | { type: 'CHANGE_PACKAGE_INPUT'; payload: { tier: 'basic' | 'standard' | 'premium' | string; name: string; value: any } }
  | { type: 'ADD_PACKAGE_FEATURE'; payload: { tier: 'basic' | 'standard' | 'premium' | string; feature: string } }
  | { type: 'REMOVE_PACKAGE_FEATURE'; payload: { tier: 'basic' | 'standard' | 'premium' | string; feature: string } }
  | { type: 'TOGGLE_PACKAGE_TIER'; payload: { tier: 'standard' | 'premium' | string } }
  | { type: 'INITIALIZE_STATE'; payload: PackageFormState };

export const packageReducer = (state: PackageFormState, action: PackageAction): PackageFormState => {
  switch (action.type) {
    case 'CHANGE_INPUT':
      return {
        ...state,
        [action.payload.name]: action.payload.value
      };

    case 'ADD_IMAGES':
      return {
        ...state,
        cover: action.payload.cover,
        images: action.payload.images
      };

    case 'ADD_FEATURE':
      return {
        ...state,
        features: [...state.features, action.payload]
      };

    case 'REMOVE_FEATURE':
      return {
        ...state,
        features: state.features.filter((feature) => feature !== action.payload)
      };

    case 'ADD_FAQ':
      return {
        ...state,
        faqs: [...(state.faqs || []), action.payload]
      };

    case 'REMOVE_FAQ':
      return {
        ...state,
        faqs: (state.faqs || []).filter((_, index) => index !== action.payload)
      };

    case 'CHANGE_PACKAGE_INPUT': {
      const currentTier = state.packages[action.payload.tier];
      if (!currentTier) return state;
      return {
        ...state,
        packages: {
          ...state.packages,
          [action.payload.tier]: {
            ...currentTier,
            [action.payload.name]: action.payload.value
          }
        }
      };
    }

    case 'ADD_PACKAGE_FEATURE': {
      const currentTier = state.packages[action.payload.tier];
      if (!currentTier) return state;
      return {
        ...state,
        packages: {
          ...state.packages,
          [action.payload.tier]: {
            ...currentTier,
            features: [...currentTier.features, action.payload.feature]
          }
        }
      };
    }

    case 'REMOVE_PACKAGE_FEATURE': {
      const currentTier = state.packages[action.payload.tier];
      if (!currentTier) return state;
      return {
        ...state,
        packages: {
          ...state.packages,
          [action.payload.tier]: {
            ...currentTier,
            features: currentTier.features.filter((feature) => feature !== action.payload.feature)
          }
        }
      };
    }

    case 'TOGGLE_PACKAGE_TIER': {
      const isEnabled = state.packages[action.payload.tier] !== null;
      return {
        ...state,
        packages: {
          ...state.packages,
          [action.payload.tier]: isEnabled ? null : {
            title: '',
            shortDesc: '',
            price: 0,
            deliveryTime: '',
            revisionNumber: '',
            features: []
          }
        }
      };
    }

    case 'INITIALIZE_STATE':
      return action.payload;

    default:
      return state;
  }
};
