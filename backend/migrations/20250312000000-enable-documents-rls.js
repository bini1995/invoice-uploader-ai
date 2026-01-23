const ensurePolicy = async (queryInterface, policyName, createPolicy) => {
  const [results] = await queryInterface.sequelize.query(
    'SELECT 1 FROM pg_policies WHERE policyname = $1 AND tablename = $2 LIMIT 1',
    { bind: [policyName, 'documents'] }
  );
  if (results.length === 0) {
    await createPolicy();
  }
};

const ensureRls = async (queryInterface) => {
  await queryInterface.sequelize.query('ALTER TABLE documents ENABLE ROW LEVEL SECURITY;');
  await queryInterface.sequelize.query('ALTER TABLE documents FORCE ROW LEVEL SECURITY;');
};

export const up = async ({ context: queryInterface }) => {
  const tables = await queryInterface.showAllTables();
  const normalized = tables.map((table) => (typeof table === 'object' ? table.tableName : table));
  if (!normalized.includes('documents')) {
    return;
  }

  await ensureRls(queryInterface);
  await ensurePolicy(queryInterface, 'documents_tenant_isolation', async () => {
    await queryInterface.sequelize.query(`
      CREATE POLICY documents_tenant_isolation ON documents
      USING (
        tenant_id::text = current_setting('app.tenant_id', true)
        OR current_setting('app.tenant_id', true) = 'all'
      )
      WITH CHECK (
        tenant_id::text = current_setting('app.tenant_id', true)
        OR current_setting('app.tenant_id', true) = 'all'
      );
    `);
  });
};

export const down = async ({ context: queryInterface }) => {
  const tables = await queryInterface.showAllTables();
  const normalized = tables.map((table) => (typeof table === 'object' ? table.tableName : table));
  if (!normalized.includes('documents')) {
    return;
  }

  await queryInterface.sequelize.query('DROP POLICY IF EXISTS documents_tenant_isolation ON documents;');
  await queryInterface.sequelize.query('ALTER TABLE documents DISABLE ROW LEVEL SECURITY;');
};
