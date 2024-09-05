import React, { useState, useEffect } from 'react';
import './Availabletimesform.css';
import './Navbar.css';

const AvailableTimesForm = ({ onSaveTimes, onDeleteTimes, availableTimes }) => {
    const [times, setTimes] = useState([]);
    const [timeInput, setTimeInput] = useState('');
    const [timeToDelete, setTimeToDelete] = useState('');
    const [templates, setTemplates] = useState([]);
    const [templateName, setTemplateName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    useEffect(() => {
        const savedTemplates = JSON.parse(localStorage.getItem('timeTemplates')) || [];
        setTemplates(savedTemplates);
    }, []);

    const handleAddTime = () => {
        if (timeInput) {
            setTimes([...times, timeInput]);
            setTimeInput('');
        }
    };

    const handleDeleteTimes = () => {
        if (timeToDelete) {
            onDeleteTimes([timeToDelete]);
            setTimeToDelete('');
        }
    };

    const handleSave = () => {
        onSaveTimes(times);
        setTimes([]);
    };

    const handleSaveTemplate = () => {
        if (templateName && times.length) {
            const newTemplate = { name: templateName, times };
            const updatedTemplates = [...templates, newTemplate];
            setTemplates(updatedTemplates);
            localStorage.setItem('timeTemplates', JSON.stringify(updatedTemplates));
            setTemplateName('');
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

    const handleDeleteTemplate = (templateNameToDelete) => {
        const updatedTemplates = templates.filter(t => t.name !== templateNameToDelete);
        setTemplates(updatedTemplates);
        localStorage.setItem('timeTemplates', JSON.stringify(updatedTemplates));
    };

    return (
        <div className="times-form">
            <div className="form-group">
                <input
                    type="text"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    placeholder="Enter available time (e.g., 09:00 AM)"
                    className="input"
                />
                <button className="add-button" onClick={handleAddTime}>Add Time</button>
                <button className="save-button" onClick={handleSave}>Save Times</button>
            </div>

            <div className="form-group">
                <input
                    type="text"
                    value={timeToDelete}
                    onChange={(e) => setTimeToDelete(e.target.value)}
                    placeholder="Time to delete"
                    className="input"
                />
                <button className="delete-button" onClick={handleDeleteTimes}>Delete Time</button>
            </div>

            <div>
                <h4 className="label">Times to Save</h4>
                <ul className="list">
                    {times.map((time, index) => (
                        <li key={index} className="list-item">{time}</li>
                    ))}
                </ul>
            </div>

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
                            <button className="delete-button" onClick={() => handleDeleteTemplate(template.name)}>Delete Template</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="label">Existing Times</h4>
                <ul className="list">
                    {availableTimes.map((time, index) => (
                        <li key={index} className="list-item">
                            {time}
                            <button className="delete-button" onClick={() => onDeleteTimes([time])}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AvailableTimesForm;
