import * as fs from 'fs';
import * as path from 'path';

// Path to the workspace directory containing the SCAD and STL files
const WORKSPACE_DIR = path.join(__dirname, '../workspace');

function analyzeWorkspace(): void {
    console.log('🔍 Analyzing ModelMint Workspace...');
    
    if (!fs.existsSync(WORKSPACE_DIR)) {
        console.log('Workspace directory is empty or not found.');
        return;
    }

    const files = fs.readdirSync(WORKSPACE_DIR);
    let totalSize = 0;

    console.log('\n📁 Workspace Files:');
    console.log('-------------------');
    
    files.forEach(file => {
        const filePath = path.join(WORKSPACE_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
            const sizeKB = (stats.size / 1024).toFixed(2);
            totalSize += stats.size;
            console.log(`📄 ${file} - ${sizeKB} KB`);
        }
    });

    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log('-------------------');
    console.log(`✅ Total files: ${files.length}`);
    console.log(`💾 Total storage used: ${totalSizeMB} MB\n`);
}

// Execute the function
analyzeWorkspace();
