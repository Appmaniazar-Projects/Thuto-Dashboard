import React from 'react';

const SystemSettings = () => {
    return (
        <div>
            <h1>Admin System Settings</h1>
            <form>
                <div>
                    <label htmlFor="setting1">Setting 1</label>
                    <input type="text" id="setting1" name="setting1" />
                </div>
                <div>
                    <label htmlFor="setting2">Setting 2</label>
                    <input type="text" id="setting2" name="setting2" />
                </div>
                <div>
                    <label htmlFor="setting3">Setting 3</label>
                    <input type="text" id="setting3" name="setting3" />
                </div>
                <button type="submit">Save Settings</button>
            </form>
        </div>
    );
};

export default SystemSettings;
