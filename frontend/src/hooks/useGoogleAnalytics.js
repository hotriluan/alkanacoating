import { useEffect } from 'react';
import api, { apiReady } from '../services/api';

const useGoogleAnalytics = () => {
  useEffect(() => {
    const fetchAndInjectGAScript = async () => {
      try {
        // Wait for the API service to be fully initialized, especially in dev mode.
        await apiReady;

        const response = await api.get('/settings/public-settings');
        const publicSettings = response.data;
        const gaScriptContent = publicSettings.google_analytics_script;

        if (gaScriptContent) {
          // Avoid re-injecting the same script
          if (document.getElementById('google-analytics-script-container')) {
            return;
          }

          // The script content might contain multiple <script> tags.
          // We need to parse them and append them to the head.
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = gaScriptContent;

          const scriptTags = Array.from(tempDiv.querySelectorAll('script'));
          
          if (scriptTags.length > 0) {
            const container = document.createElement('div');
            container.id = 'google-analytics-script-container';

            scriptTags.forEach(originalScript => {
              const newScript = document.createElement('script');
              
              // Copy attributes (src, async, etc.)
              for (let i = 0; i < originalScript.attributes.length; i++) {
                const attr = originalScript.attributes[i];
                newScript.setAttribute(attr.name, attr.value);
              }
              
              // Copy inner content
              if (originalScript.innerHTML) {
                newScript.innerHTML = originalScript.innerHTML;
              }
              
              container.appendChild(newScript);
            });

            document.head.appendChild(container);
          }
        }
      } catch (error) {
        console.error('Failed to fetch Google Analytics script:', error);
      }
    };

    fetchAndInjectGAScript();
  }, []); // Run only once on component mount
};

export default useGoogleAnalytics;
