import React, { useState, useEffect, useRef } from 'react';
import supabase from '../supabaseClient';
import './AvailableTimesForm.css';

const isValidTime = (time) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
};

const formatTime = (time) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AvailableTimesForm = ({ onSaveTimes, availableTimes, selectedDate }) => {
    const [times, setTimes] = useState([]);
    const [timeInput, setTimeInput] = useState('');
    const [templates, setTemplates] = useState([]);
    const [templateName, setTemplateName] = useState('');
    const [menuTemplate, setMenuTemplate] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [errors, setErrors] = useState([]);
    const menuRef = useRef(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const { data, error } = await supabase
                    .from('time-templates')
                    .select('*');

                if (error) throw error;

                setTemplates(data || []);
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
        if (isValidTime(timeInput)) {
            setTimes([...times, timeInput]);
            setTimeInput('');
        } else {
            setErrors(['Invalid time format.']);
        }
    };

    const handleSave = async () => {
        if (times.length === 0) {
            alert('No times to save.');
            return;
        }

        try {
            const formattedTimes = times.map(time => ({
                date: selectedDate.toISOString().split('T')[0], // Save the selected date with time
                time: time
            }));

            const { data, error } = await supabase
                .from('available_times')
                .upsert(formattedTimes, { returning: 'representation' });

            if (error) throw error;

            setTimes([]);
            setErrors([]);
        } catch (error) {
            console.error('Error saving times:', error);
            setErrors(['An error occurred while saving times.']);
        }
    };

    const handleSaveTemplate = async () => {
        if (templateName && times.length) {
            const templateTimes = times.map(time => ({ time: time }));

            try {
                const newTemplate = { name: templateName, times: JSON.stringify(templateTimes) };
                const { error } = await supabase
                    .from('time-templates')
                    .insert([newTemplate]);

                if (error) throw error;

                const { data, error: fetchError } = await supabase
                    .from('time-templates')
                    .select('*');

                if (fetchError) throw fetchError;

                setTemplates(data || []);
                setTemplateName('');
                setTimes([]);
                setErrors([]);
            } catch (error) {
                console.error('Error saving template:', error);
            }
        } else {
            alert('Template name or times cannot be empty');
        }
    };

    const handleSelectTemplate = (template) => {
        const templateTimes = JSON.parse(template.times);
        const appliedTimes = templateTimes.map(time => ({ date: selectedDate.toISOString().split('T')[0], time: time.time }));
        
        // Add or update times for the selected date
        setTimes(appliedTimes);
        setMenuTemplate(null);
    };

    const handleDeleteTemplate = async () => {
        if (templateToDelete) {
            try {
                const { error } = await supabase
                    .from('time-templates')
                    .delete()
                    .eq('name', templateToDelete);

                if (error) throw error;

                const { data, error: fetchError } = await supabase
                    .from('time-templates')
                    .select('*');

                if (fetchError) throw fetchError;

                setTemplates(data || []);
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

    const handleActionClick = (template) => {
        setMenuTemplate(template);
        setShowConfirmation(false);
    };

    const handleMenuAction = (action) => {
        if (action === 'Delete') {
            setTemplateToDelete(menuTemplate.name);
            setShowConfirmation(true);
        } else if (action === 'Use') {
            handleSelectTemplate(menuTemplate);
        }
    };

    return (
        <div className="times-form">
            <div className="left-side">
                <div className="form-group">
                    <h4 className="label">Add Times</h4>
                    <input
                        type="time"
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        placeholder="Enter time"
                        className="input"
                    />
                    <button className="add-button" onClick={handleAddTime}>Add Time</button>
                </div>

                {errors.length > 0 && (
                    <div className="errors">
                        {errors.map((error, index) => (
                            <div key={index} className="error-message">{error}</div>
                        ))}
                    </div>
                )}

                <div>
                    <h4 className="label">Times to be saved</h4>
                    <ul className="list">
                        {times.map((time, index) => (
                            <li key={index} className="list-item">
                                {formatTime(time)}
                                <span className="delete-icon" onClick={() => setTimes(times.filter((_, i) => i !== index))}>×</span>
                            </li>
                        ))}
                    </ul>
                    <button className="save-button" onClick={handleSave}>Save Times</button>
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
                    <button className="save-button" onClick={handleSaveTemplate}>Save Template</button>
                </div>

                <div className="template-section">
                    <h4 className="label">Manage Templates</h4>
                    <ul className="template-list">
                        {templates.map((template) => (
                            <li key={template.id} className="template-item">
                                <span>{template.name}</span>
                                <div className="actions">
                                    <button onClick={() => handleActionClick(template)}>Actions</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {showConfirmation && (
                    <div className="confirmation-popup">
                        <p>Are you sure you want to delete this template?</p>
                        <button onClick={handleConfirmDelete}>Yes</button>
                        <button onClick={() => setShowConfirmation(false)}>No</button>
                    </div>
                )}

                {menuTemplate && (
                    <div className="menu-popup" ref={menuRef}>
                        <button onClick={() => handleMenuAction('Use')}>Use</button>
                        <button onClick={() => handleMenuAction('Delete')}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableTimesForm;
