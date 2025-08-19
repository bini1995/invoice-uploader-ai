import React, { createContext, useContext, useState, useEffect } from 'react';

const WhiteLabelContext = createContext();

export const useWhiteLabel = () => {
    const context = useContext(WhiteLabelContext);
    if (!context) {
        throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
    }
    return context;
};

export const WhiteLabelProvider = ({ children, tenantId = 'default' }) => {
    const [theme, setTheme] = useState({
        // Default theme
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderRadius: '8px',
        fontFamily: 'Inter, system-ui, sans-serif',
        logo: '/logo.svg',
        companyName: 'ClarifyOps',
        favicon: '/favicon.ico',
        customCSS: '',
        features: {
            showAnalytics: true,
            showFraudDetection: true,
            showWorkflowBuilder: true,
            showAPI: true
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTenantTheme();
    }, [tenantId]);

    const loadTenantTheme = async () => {
        try {
            const response = await fetch(`/api/superior/tenants/${tenantId}/theme`, {
                headers: {
                    'X-Tenant-Id': tenantId,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const tenantTheme = await response.json();
                setTheme(prevTheme => ({
                    ...prevTheme,
                    ...tenantTheme.data
                }));
            }
        } catch (error) {
            console.error('Failed to load tenant theme:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTheme = async (newTheme) => {
        try {
            const response = await fetch(`/api/superior/tenants/${tenantId}/theme`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-Id': tenantId,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newTheme)
            });

            if (response.ok) {
                setTheme(prevTheme => ({
                    ...prevTheme,
                    ...newTheme
                }));
                applyThemeToDOM(newTheme);
                return true;
            }
        } catch (error) {
            console.error('Failed to update theme:', error);
            return false;
        }
    };

    const applyThemeToDOM = (themeData) => {
        const root = document.documentElement;
        
        // Apply CSS custom properties
        root.style.setProperty('--primary-color', themeData.primaryColor);
        root.style.setProperty('--secondary-color', themeData.secondaryColor);
        root.style.setProperty('--accent-color', themeData.accentColor);
        root.style.setProperty('--background-color', themeData.backgroundColor);
        root.style.setProperty('--text-color', themeData.textColor);
        root.style.setProperty('--border-color', themeData.borderColor);
        root.style.setProperty('--border-radius', themeData.borderRadius);
        root.style.setProperty('--font-family', themeData.fontFamily);

        // Apply custom CSS
        if (themeData.customCSS) {
            let styleElement = document.getElementById('white-label-custom-css');
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = 'white-label-custom-css';
                document.head.appendChild(styleElement);
            }
            styleElement.textContent = themeData.customCSS;
        }

        // Update favicon
        if (themeData.favicon) {
            const favicon = document.querySelector('link[rel="icon"]');
            if (favicon) {
                favicon.href = themeData.favicon;
            }
        }
    };

    useEffect(() => {
        if (!loading) {
            applyThemeToDOM(theme);
        }
    }, [theme, loading]);

    const value = {
        theme,
        updateTheme,
        loading,
        tenantId
    };

    return (
        <WhiteLabelContext.Provider value={value}>
            {children}
        </WhiteLabelContext.Provider>
    );
};

// Theme customization component
export const ThemeCustomizer = () => {
    const { theme, updateTheme } = useWhiteLabel();
    const [isOpen, setIsOpen] = useState(false);
    const [tempTheme, setTempTheme] = useState(theme);

    const handleSave = async () => {
        const success = await updateTheme(tempTheme);
        if (success) {
            setIsOpen(false);
        }
    };

    const handleReset = () => {
        setTempTheme(theme);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Customize Theme"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Theme Customization</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Colors */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Colors</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Primary Color</label>
                                        <input
                                            type="color"
                                            value={tempTheme.primaryColor}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            className="w-full h-10 rounded border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Secondary Color</label>
                                        <input
                                            type="color"
                                            value={tempTheme.secondaryColor}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                            className="w-full h-10 rounded border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Accent Color</label>
                                        <input
                                            type="color"
                                            value={tempTheme.accentColor}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                                            className="w-full h-10 rounded border"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Branding */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Branding</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            value={tempTheme.companyName}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, companyName: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Logo URL</label>
                                        <input
                                            type="url"
                                            value={tempTheme.logo}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, logo: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Favicon URL</label>
                                        <input
                                            type="url"
                                            value={tempTheme.favicon}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, favicon: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Typography */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Typography</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Font Family</label>
                                        <select
                                            value={tempTheme.fontFamily}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded"
                                        >
                                            <option value="Inter, system-ui, sans-serif">Inter</option>
                                            <option value="Roboto, sans-serif">Roboto</option>
                                            <option value="Open Sans, sans-serif">Open Sans</option>
                                            <option value="Lato, sans-serif">Lato</option>
                                            <option value="Poppins, sans-serif">Poppins</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Border Radius</label>
                                        <input
                                            type="text"
                                            value={tempTheme.borderRadius}
                                            onChange={(e) => setTempTheme(prev => ({ ...prev, borderRadius: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded"
                                            placeholder="8px"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Features</h3>
                                <div className="space-y-3">
                                    {Object.entries(tempTheme.features).map(([key, value]) => (
                                        <div key={key} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={key}
                                                checked={value}
                                                onChange={(e) => setTempTheme(prev => ({
                                                    ...prev,
                                                    features: {
                                                        ...prev.features,
                                                        [key]: e.target.checked
                                                    }
                                                }))}
                                                className="mr-2"
                                            />
                                            <label htmlFor={key} className="text-sm">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Custom CSS */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Custom CSS</h3>
                            <textarea
                                value={tempTheme.customCSS}
                                onChange={(e) => setTempTheme(prev => ({ ...prev, customCSS: e.target.value }))}
                                className="w-full h-32 px-3 py-2 border rounded font-mono text-sm"
                                placeholder="/* Add your custom CSS here */"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WhiteLabelProvider; 