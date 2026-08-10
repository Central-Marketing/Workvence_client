export const initialState = {
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
}

export const packageReducer = (state, { type, payload }) => {
    switch(type) {
        case 'CHANGE_INPUT':
            return {
                ...state,
                [payload.name]: payload.value
            }

        case 'ADD_IMAGES':
            return {
                ...state,
                cover: payload.cover,
                images: payload.images
            }

        case 'ADD_FEATURE':
            return {
                ...state,
                features: [...state.features, payload]
            }

        case 'REMOVE_FEATURE':
            return {
                ...state,
                features: state.features.filter((feature) => feature !== payload)
            }
            
        case 'CHANGE_PACKAGE_INPUT':
            return {
                ...state,
                packages: {
                    ...state.packages,
                    [payload.tier]: {
                        ...state.packages[payload.tier],
                        [payload.name]: payload.value
                    }
                }
            }
            
        case 'ADD_PACKAGE_FEATURE':
            return {
                ...state,
                packages: {
                    ...state.packages,
                    [payload.tier]: {
                        ...state.packages[payload.tier],
                        features: [...state.packages[payload.tier].features, payload.feature]
                    }
                }
            }

        case 'REMOVE_PACKAGE_FEATURE':
            return {
                ...state,
                packages: {
                    ...state.packages,
                    [payload.tier]: {
                        ...state.packages[payload.tier],
                        features: state.packages[payload.tier].features.filter((feature) => feature !== payload.feature)
                    }
                }
            }

        case 'TOGGLE_PACKAGE_TIER':
            const isEnabled = state.packages[payload.tier] !== null;
            return {
                ...state,
                packages: {
                    ...state.packages,
                    [payload.tier]: isEnabled ? null : {
                        title: '',
                        shortDesc: '',
                        price: 0,
                        deliveryTime: '',
                        revisionNumber: '',
                        features: []
                    }
                }
            }

        case 'INITIALIZE_STATE':
            return payload;

        default:
            return state;
    }
}