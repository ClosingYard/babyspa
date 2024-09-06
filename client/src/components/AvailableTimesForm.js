import React, { useState, useEffect, useRef } from 'react';
import './AvailableTimesForm.css';
import axios from 'axios';
import config from '../config';

const AvailableTimesForm = ({ onSaveTimes, onDeleteTimes, availableTimes }) => {
    const [times, setTimes] = useState([]);
    const [timeInput, setTimeInput] = useState('');
    const [templates, setTemplates] = useState([]);
    const [templateName, setTemplateName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [menuTemplate, setMenuTemplate] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const menuRef = useRef(null); // Ref for the menu container

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(`${config.baseURL}/get-templates`);
                setTemplates(response.data || []);
            } catch (error) {
                console.error('Error fetching templates:', error);
            }
        };

        fetchTemplates();
    }, []);

    useEffect(() => {
        // Close the menu if clicked outside
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuTemplate(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddTime = () => {
        if (timeInput) {
            setTimes([...times, timeInput]);
            setTimeInput('');
        }
    };

    const handleSave = () => {
        onSaveTimes(times);
        setTimes([]);
    };

    const handleSaveTemplate = async () => {
        if (templateName && times.length) {
            try {
                const newTemplate = { name: templateName, times };
                await axios.post(`${config.baseURL}/save-template`, newTemplate);

                const response = await axios.get(`${config.baseURL}/get-templates`);
                setTemplates(response.data || []);
                setTemplateName('');
            } catch (error) {
                console.error('Error saving template:', error);
            }
        } else {
            alert('Template name or times cannot be empty');
        }
    };

    const handleSelectTemplate = (e) => {
        const selected = e.target.value;
        setSelectedTemplate(selected);
        const template = templates.find((t) => t.name === selected);
        if (template) {
            setTimes(template.times);
        }
    };

    const handleDeleteTemplate = async () => {
        if (templateToDelete) {
            try {
                await axios.delete(`${config.baseURL}/delete-template`, { data: { name: templateToDelete } });

                const response = await axios.get(`${config.baseURL}/get-templates`);
                setTemplates(response.data || []);
                setShowConfirmation(false);
                setTemplateToDelete(null);
            } catch (error) {
                console.error('Error deleting template:', error);
            }
        }
    };

    const handleConfirmDelete = () => {
        handleDeleteTemplate();
    };

    const handleActionClick = (templateName) => {
        setMenuTemplate(templateName);
        setShowConfirmation(false);
    };

    const handleMenuAction = (action) => {
        if (action === 'Delete') {
            setTemplateToDelete(menuTemplate);
            setShowConfirmation(true);
        } else if (action === 'Use') {
            const template = templates.find((t) => t.name === menuTemplate);
            if (template) {
                setTimes(template.times);
            }
            setMenuTemplate(null);
        }
    };

    return (
        <div className="times-form">
            <div className="left-side">
                <div className="form-group">
                    <h4 className="label">Tijden toevoegen.</h4>
                    <input
                        type="text"
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        placeholder="Enter available time (e.g., 09:00 AM)"
                        className="input"
                    />
                    <button className="add-button" onClick={handleAddTime}>Add Time</button>
                </div>

                <div>
                    <h4 className="label">Tijden die nog opgeslagen moeten worden.</h4>
                    <ul className="list">
                        {times.map((time, index) => (
                            <li key={index} className="list-item">
                                {time}
                                <span className="delete-icon" onClick={() => setTimes(times.filter((_, i) => i !== index))}>×</span>
                            </li>
                        ))}
                    </ul>
                    <button className="save-button" onClick={handleSave}>Save Times</button>
                </div>

                <div>
                    <h4 className="label">Actieve tijden in agenda.</h4>
                    <ul className="list">
                        {availableTimes.map((time, index) => (
                            <li key={index} className="list-item">
                                {time}
                                <span className="delete-icon" onClick={() => onDeleteTimes([time])}>×</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="right-side">
                <div className="template-section">
                    <h4 className="label">Create Template</h4>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template Name"
                        className="input"
                    />
                    <button className="add-button" onClick={handleSaveTemplate}>Save Template</button>
                </div>

                <div className="template-section">
                    <h4 className="label">Use Template</h4>
                    <select className="select" value={selectedTemplate} onChange={handleSelectTemplate}>
                        <option value="">Select a template</option>
                        {templates.map((template, index) => (
                            <option key={index} value={template.name}>
                                {template.name}
                            </option>
                        ))}
                    </select>

                    <h4 className="label">Saved Templates</h4>
                    <ul className="list">
                        {templates.map((template, index) => (
                            <li key={index} className="list-item">
                                {template.name}
                                <button
                                    className="menu-button"
                                    onClick={() => handleActionClick(template.name)}
                                >
                                    Actions
                                </button>
                                {menuTemplate === template.name && (
                                    <div className="split-menu" ref={menuRef}>
                                        <button
                                            className="menu-button"
                                            onClick={() => handleMenuAction('Use')}
                                        >
                                            Use Template
                                        </button>
                                        <button
                                            className="menu-button"
                                            onClick={() => handleMenuAction('Delete')}
                                        >
                                            Delete Template
                                        </button>
                                        <button
                                            className="menu-button close-button"
                                            onClick={() => setMenuTemplate(null)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {showConfirmation && (
                <div className="confirmation-dialog">
                    <p>Are you sure you want to delete this template?</p>
                    <button className="confirm-button" onClick={handleConfirmDelete}>Yes</button>
                    <button className="cancel-button" onClick={() => setShowConfirmation(false)}>No</button>
                </div>
            )}
        </div>
    );
};

export default AvailableTimesForm;
