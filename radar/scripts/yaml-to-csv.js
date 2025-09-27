#!/usr/bin/env node

/**
 * Convert Canon Technology Radar YAML data to CSV format
 * for use with build-your-own-radar tool
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Quadrant mapping for CSV output
const QUADRANT_MAP = {
  'tools-libraries': 'Tools & Libraries',
  'techniques-patterns': 'Techniques & Patterns', 
  'features-capabilities': 'Features & Capabilities',
  'data-structures-formats': 'Data Structures, Formats & Standards'
};

// Ring mapping for CSV output
const RING_MAP = {
  'adopt': 'Adopt',
  'trial': 'Trial',
  'assess': 'Assess', 
  'hold': 'Hold'
};

function convertYamlToCsv(yamlPath, csvPath) {
  try {
    // Read and parse YAML file
    const yamlContent = readFileSync(yamlPath, 'utf8');
    const data = parse(yamlContent);
    
    // Generate CSV content
    const csvRows = ['name,ring,quadrant,isNew,description'];
    
    // Process each quadrant
    Object.entries(data).forEach(([quadrantKey, quadrantData]) => {
      if (quadrantKey === 'metadata') return; // Skip metadata
      
      const quadrantName = QUADRANT_MAP[quadrantKey] || quadrantKey;
      
      // Process each ring in the quadrant
      Object.entries(quadrantData).forEach(([ringKey, items]) => {
        const ringName = RING_MAP[ringKey] || ringKey;
        
        // Process each item in the ring
        items.forEach(item => {
          const row = [
            escapeCsvField(item.name),
            escapeCsvField(ringName),
            escapeCsvField(quadrantName),
            item.isNew ? 'true' : 'false',
            escapeCsvField(item.description)
          ].join(',');
          
          csvRows.push(row);
        });
      });
    });
    
    // Write CSV file
    writeFileSync(csvPath, csvRows.join('\n'));
    console.log(`✅ Converted ${yamlPath} to ${csvPath}`);
    console.log(`📊 Generated ${csvRows.length - 1} radar entries`);
    
  } catch (error) {
    console.error('❌ Error converting YAML to CSV:', error.message);
    process.exit(1);
  }
}

function escapeCsvField(field) {
  if (typeof field !== 'string') return field;
  
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (field.includes('"') || field.includes(',') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
}

// Main execution
const yamlPath = join(__dirname, '..', 'data.yaml');
const csvPath = join(__dirname, '..', 'data.csv');

convertYamlToCsv(yamlPath, csvPath);