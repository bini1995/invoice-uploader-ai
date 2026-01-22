import { DataTypes } from 'sequelize';

const ensureTable = async (queryInterface, tableName, definition) => {
  const tables = await queryInterface.showAllTables();
  const normalized = tables.map((table) => (typeof table === 'object' ? table.tableName : table));
  if (!normalized.includes(tableName)) {
    await queryInterface.createTable(tableName, definition);
  }
};

const ensureIndex = async (queryInterface, tableName, fields, options = {}) => {
  const indexes = await queryInterface.showIndex(tableName);
  const exists = indexes.some((index) => index.name === options.name);
  if (!exists) {
    await queryInterface.addIndex(tableName, fields, options);
  }
};

const ensureColumn = async (queryInterface, tableName, columnName, definition) => {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

const ensureConstraint = async (queryInterface, name, addConstraint) => {
  const [results] = await queryInterface.sequelize.query(
    'SELECT 1 FROM pg_constraint WHERE conname = $1 LIMIT 1',
    { bind: [name] }
  );
  if (results.length === 0) {
    await addConstraint();
  }
};

const removeConstraintIfExists = async (queryInterface, tableName, name) => {
  const [results] = await queryInterface.sequelize.query(
    'SELECT 1 FROM pg_constraint WHERE conname = $1 LIMIT 1',
    { bind: [name] }
  );
  if (results.length > 0) {
    await queryInterface.removeConstraint(tableName, name);
  }
};

export const up = async ({ context: queryInterface }) => {
  await ensureTable(queryInterface, 'usage_logs', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    tenant_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: queryInterface.sequelize.literal('NOW()'),
    },
    month: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
  });

  await ensureTable(queryInterface, 'monthly_usage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    tenant_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    month: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: queryInterface.sequelize.literal('NOW()'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: queryInterface.sequelize.literal('NOW()'),
    },
  });

  await ensureConstraint(queryInterface, 'monthly_usage_tenant_month_action_unique', async () => {
    await queryInterface.addConstraint('monthly_usage', {
      fields: ['tenant_id', 'month', 'action'],
      type: 'unique',
      name: 'monthly_usage_tenant_month_action_unique',
    });
  });

  await ensureColumn(queryInterface, 'users', 'plan_type', {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'free',
  });

  await ensureIndex(queryInterface, 'usage_logs', ['tenant_id'], {
    name: 'idx_usage_logs_tenant_id',
  });
  await ensureIndex(queryInterface, 'usage_logs', ['user_id'], {
    name: 'idx_usage_logs_user_id',
  });
  await ensureIndex(queryInterface, 'usage_logs', ['action'], {
    name: 'idx_usage_logs_action',
  });
  await ensureIndex(queryInterface, 'usage_logs', ['created_at'], {
    name: 'idx_usage_logs_created_at',
  });
  await ensureIndex(queryInterface, 'usage_logs', ['month'], {
    name: 'idx_usage_logs_month',
  });
  await ensureIndex(queryInterface, 'usage_logs', ['tenant_id', 'month'], {
    name: 'idx_usage_logs_tenant_month',
  });

  await ensureIndex(queryInterface, 'monthly_usage', ['tenant_id'], {
    name: 'idx_monthly_usage_tenant_id',
  });
  await ensureIndex(queryInterface, 'monthly_usage', ['month'], {
    name: 'idx_monthly_usage_month',
  });
  await ensureIndex(queryInterface, 'monthly_usage', ['action'], {
    name: 'idx_monthly_usage_action',
  });
  await ensureIndex(queryInterface, 'monthly_usage', ['tenant_id', 'month'], {
    name: 'idx_monthly_usage_tenant_month',
  });

  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_monthly_usage_updated_at'
      ) THEN
        CREATE TRIGGER update_monthly_usage_updated_at
          BEFORE UPDATE ON monthly_usage
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `);

  await queryInterface.sequelize.query(`
    CREATE OR REPLACE VIEW usage_stats_view AS
    SELECT
      mu.tenant_id,
      mu.month,
      mu.action,
      mu.count as current_month_count,
      COALESCE(SUM(mu2.count), 0) as total_count
    FROM monthly_usage mu
    LEFT JOIN monthly_usage mu2 ON mu.tenant_id = mu2.tenant_id
      AND mu.action = mu2.action
      AND mu2.month <= mu.month
    GROUP BY mu.tenant_id, mu.month, mu.action, mu.count;
  `);
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query('DROP VIEW IF EXISTS usage_stats_view;');
  await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_monthly_usage_updated_at ON monthly_usage;');
  await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_updated_at_column();');
  await queryInterface.removeIndex('monthly_usage', 'idx_monthly_usage_tenant_month');
  await queryInterface.removeIndex('monthly_usage', 'idx_monthly_usage_action');
  await queryInterface.removeIndex('monthly_usage', 'idx_monthly_usage_month');
  await queryInterface.removeIndex('monthly_usage', 'idx_monthly_usage_tenant_id');
  await queryInterface.removeIndex('usage_logs', 'idx_usage_logs_tenant_month');
  await queryInterface.removeIndex('usage_logs', 'idx_usage_logs_month');
  await queryInterface.removeIndex('usage_logs', 'idx_usage_logs_created_at');
  await queryInterface.removeIndex('usage_logs', 'idx_usage_logs_action');
  await queryInterface.removeIndex('usage_logs', 'idx_usage_logs_user_id');
  await queryInterface.removeIndex('usage_logs', 'idx_usage_logs_tenant_id');
  await removeConstraintIfExists(queryInterface, 'monthly_usage', 'monthly_usage_tenant_month_action_unique');
  await queryInterface.dropTable('monthly_usage');
  await queryInterface.dropTable('usage_logs');
};
