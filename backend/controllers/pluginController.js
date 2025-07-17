const yaml = require('js-yaml');
const { addAutomation } = require('./automationController');

exports.importYaml = async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ message: 'yaml text required' });
  try {
    const data = yaml.load(text);
    if (data && Array.isArray(data.on_upload)) {
      for (const rule of data.on_upload) {
        const cond = Object.keys(rule)[0];
        const action = rule[cond];
        await addAutomation({
          body: {
            event: 'upload',
            condition: cond.replace('if ', ''),
            action: 'notify',
            config: { email: action.notify }
          },
          user: req.user
        }, { json: () => {} });
      }
    }
    res.json({ message: 'YAML rules imported' });
  } catch (err) {
    console.error('YAML import error:', err.message);
    res.status(400).json({ message: 'Invalid YAML' });
  }
};
