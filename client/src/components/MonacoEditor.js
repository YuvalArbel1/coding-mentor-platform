import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const MonacoEditor = ({ value, onChange, options, height = "100%", loading }) => {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleChange = (newValue) => {
        if (isMounted.current && onChange) {
            onChange(newValue);
        }
    };

    return (
        <Editor
            height={height}
            defaultLanguage="javascript"
            theme="vs-dark"
            value={value}
            onChange={handleChange}
            options={options}
            loading={loading}
        />
    );
};

export default MonacoEditor;