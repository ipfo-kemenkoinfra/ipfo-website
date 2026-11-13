/**
 * IPFO Contact / Enquiry Form
 * ===========================
 * - Loads the optional project list from assets/data/projects.json
 * - Shows the Project dropdown only for project-related enquiry types
 * - Prefills from URL params: contact-us.html?type=interest&project=ID
 * - Submits through IPFOCommon.handleFormSubmission (Apps Script endpoint)
 */

const IPFOContact = (function () {

    const PROJECTS_URL = 'assets/data/projects.json';
    const PROJECT_TYPES = ['interest', 'facilitation', 'bottleneck'];
    const SUCCESS_MESSAGE = 'Thank you for contacting IPFO! We have received your enquiry and will follow up by email.';

    let typeSelect, projectGroup, projectSelect;

    function updateProjectVisibility() {
        const show = PROJECT_TYPES.includes(typeSelect.value) && projectSelect.options.length > 1;
        projectGroup.hidden = !show;
        projectSelect.disabled = !show; // disabled fields are not submitted
    }

    async function loadProjects() {
        try {
            const response = await fetch(PROJECTS_URL, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const projects = (Array.isArray(data) ? data : data.projects || [])
                .filter(p => p && p.id && p.name)
                .sort((a, b) => String(a.name).localeCompare(String(b.name)));

            // Group by sector group (optgroup) when available, otherwise a flat list
            const groups = new Map();
            projects.forEach(project => {
                const key = project.sectorGroup || '';
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(project);
            });

            Array.from(groups.keys()).sort().forEach(groupName => {
                const parent = groupName ? document.createElement('optgroup') : projectSelect;
                if (groupName) parent.label = groupName;
                groups.get(groupName).forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = project.sector ? `${project.name} (${project.sector})` : project.name;
                    option.dataset.name = project.name;
                    parent.appendChild(option);
                });
                if (parent !== projectSelect) projectSelect.appendChild(parent);
            });
        } catch (err) {
            // The dropdown is optional: without it the form still works.
            console.warn('Project list not available:', err);
        }
    }

    function applyUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        const project = params.get('project');

        if (type && typeSelect.querySelector(`option[value="${CSS.escape(type)}"]`)) {
            typeSelect.value = type;
        } else if (project) {
            typeSelect.value = 'interest';
        }

        if (project && projectSelect.querySelector(`option[value="${CSS.escape(project)}"]`)) {
            projectSelect.value = project;
        }
    }

    function addProjectName(payload) {
        if (payload.projectId) {
            const option = projectSelect.selectedOptions[0];
            payload.projectName = option ? (option.dataset.name || option.textContent) : '';
        }
        payload.form_type = 'enquiry';
        return payload;
    }

    function onSuccess(payload) {
        if (window.IPFOAnalytics && IPFOAnalytics.trackEnquiry) {
            IPFOAnalytics.trackEnquiry(payload.enquiryType, payload.projectId);
        }
        updateProjectVisibility();
    }

    async function init() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        typeSelect = document.getElementById('enquiryType');
        projectGroup = document.getElementById('projectGroup');
        projectSelect = document.getElementById('projectId');

        typeSelect.addEventListener('change', updateProjectVisibility);
        form.addEventListener('reset', () => setTimeout(updateProjectVisibility, 0));

        IPFOCommon.handleFormSubmission('contactForm', 'formStatus', SUCCESS_MESSAGE, {
            transform: addProjectName,
            onSuccess: onSuccess
        });

        await loadProjects();
        applyUrlParams();
        updateProjectVisibility();
    }

    return { init };

})();

window.IPFOContact = IPFOContact;
