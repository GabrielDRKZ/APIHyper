const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importe o pacote CORS

// Conectando ao MongoDB
mongoose.connect('mongodb+srv://hypersender:hyper1234@cluster0.nmvwppt.mongodb.net/HyperSender');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB:'));
db.once('open', () => {
    console.log('Conexão bem-sucedida ao MongoDB!');
});

// Definindo o modelo do usuário
const UserSchema = new mongoose.Schema({
    userName: String,
    phoneNumber: String,
    apiKey: String,
    availableLimit: Number,
    expiryDate: Date,
    isExpired: Boolean,
    isValid: Boolean,
    messagingLimit: Number,
    newUser: Boolean,
    renewedNow: Boolean,
    switchedToFree: Boolean,
    userEmail: String,
    userPackage: String
});

// Verifica se o modelo de usuário já está registrado, caso contrário, registra-o
let UserModel;
try {
    UserModel = mongoose.model('User');
} catch (error) {
    UserModel = mongoose.model('User', UserSchema);
}

// Configurando a aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Habilitando o CORS
app.use(cors());

// Rota para responder com "oi" quando o resultado for "/"
app.get('/', (req, res) => {
    res.send('oi');
});

// Rota para obter os dados do usuário
app.get('/whatsapp/authV2', async (req, res) => {
    try {
        const { userName, phoneNumber } = req.query;
        console.log(`Recebida consulta para o usuário ${userName} com o número de telefone ${phoneNumber}`);
        
        const user = await UserModel.findOne({ userName, phoneNumber });
        if (!user) {
            console.log('Usuário não encontrado no banco de dados');
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        console.log('Dados do usuário encontrado:', user);
        res.json(user);
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
});

// Rota para salvar os dados do usuário
app.get('/whatsapp/saveUser', async (req, res) => {
    try {
        const { userName, phoneNumber } = req.query;

        // Verifica se userName e phoneNumber foram fornecidos na URL
        if (!userName || !phoneNumber) {
            return res.status(400).json({ error: 'Parâmetros userName e phoneNumber são necessários' });
        }
        
        // Verifica se o usuário já existe no banco de dados
        const existingUser = await UserModel.findOne({ userName, phoneNumber });

        // Se o usuário já existe, retornar uma mensagem indicando que o usuário já está registrado
        if (existingUser) {
            console.log('Usuário já está registrado no banco de dados');
            return res.status(400).json({ error: 'Usuário já está registrado' });
        }

        // Cria uma nova instância do modelo de usuário com os dados fornecidos
        const newUser = new UserModel({ userName, phoneNumber });

        // Salva o novo usuário no banco de dados
        await newUser.save();

        console.log('Usuário salvo com sucesso:', newUser);
        res.status(201).json(newUser); // Retorna o novo usuário salvo
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        res.status(500).json({ error: 'Erro ao salvar usuário' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
});
