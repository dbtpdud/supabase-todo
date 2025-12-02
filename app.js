// ========================================
// Supabase 초기화
// ========================================

// TODO: 본인의 Project URL과 anon key로 교체하세요!
const SUPABASE_URL = 'https://kybxkosrbaswcxoalvlw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Ynhrb3NyYmFzd2N4b2Fsdmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTA2MDgsImV4cCI6MjA3OTY2NjYwOH0.6U9X-ZC2eJI-gE16QussWuKeQXr6RAq1U2q4J8Qr1Ds';

// Supabase 클라이언트 생성
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// DOM 요소 가져오기
// ========================================

const todoForm = document.getElementById('todoForm');
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const priorityInput = document.getElementById('priorityInput');
const todoList = document.getElementById('todoList');

// ========================================
// 연결 테스트
// ========================================

async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        console.log('✅ Supabase 연결 성공!');
        console.log('테스트 데이터:', data);
    } catch (error) {
        console.error('❌ Supabase 연결 실패:', error.message);
        alert('데이터베이스 연결에 실패했습니다. API 키를 확인해주세요.');
    }
}

// ========================================
// 세션 확인 및 초기화
// ========================================

async function checkSession() {
    try {
        // 현재 세션 가져오기
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            // 로그인 상태
            console.log('✅ 세션 유효:', session.user.email);
            showApp();
            loadTodos();
        } else {
            // 비로그인 상태
            console.log('⚠️ 세션 없음 - 로그인 필요');
            showAuth();
        }
    } catch (error) {
        console.error('❌ 세션 확인 실패:', error);
        showAuth();
    }
}

// ========================================
// 인증 상태 변경 감지
// ========================================

supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔔 인증 상태 변경:', event);
    
    switch(event) {
        case 'SIGNED_IN':
            console.log('✅ 로그인됨:', session.user.email);
            showApp();
            loadTodos();
            break;
            
        case 'SIGNED_OUT':
            console.log('⚠️ 로그아웃됨');
            showAuth();
            break;
            
        case 'TOKEN_REFRESHED':
            console.log('🔄 토큰 갱신됨');
            break;
            
        case 'USER_UPDATED':
            console.log('👤 사용자 정보 업데이트됨');
            break;
    }
});

// 페이지 로드 시 세션 확인
checkSession();

// 페이지 로드 시 연결 테스트
testConnection();

console.log('📱 App.js 로드 완료');

// ========================================
// 할일 추가 (Create) - RLS 적용 버전
// ========================================

async function addTodo(title, description, priority) {
    try {
        // 현재 로그인한 사용자 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert('로그인이 필요합니다.');
            return null;
        }
        
        const { data, error } = await supabase
            .from('todos')
            .insert([
                { 
                    title: title,
                    description: description,
                    priority: priority,
                    user_id: user.id  // ← 사용자 ID 자동 설정
                }
            ])
            .select();
        
        if (error) throw error;
        
        console.log('✅ 할일 추가 성공:', data);
        return data;
    } catch (error) {
        console.error('❌ 할일 추가 실패:', error.message);
        alert('할일 추가에 실패했습니다.');
        return null;
    }
}

// 폼 제출 이벤트 처리
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // 페이지 새로고침 방지
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;
    
    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }
    
    // 할일 추가
    const newTodo = await addTodo(title, description, priority);
    
    if (newTodo) {
        // 폼 초기화
        todoForm.reset();
        
        // 목록 새로고침
        loadTodos();
    }
});

// ========================================
// 할일 목록 불러오기 (Read)
// ========================================

async function loadTodos() {
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false });  // 최신순 정렬
        
        if (error) throw error;
        
        console.log('✅ 할일 목록 로드:', data);
        displayTodos(data);
    } catch (error) {
        console.error('❌ 할일 로드 실패:', error.message);
        todoList.innerHTML = '<p class="text-red-500 text-center">데이터를 불러올 수 없습니다.</p>';
    }
}

// 할일 목록을 화면에 표시
function displayTodos(todos) {
    if (todos.length === 0) {
        todoList.innerHTML = '<p class="text-gray-500 text-center py-8">할일이 없습니다. 새로운 할일을 추가해보세요!</p>';
        return;
    }
    
    todoList.innerHTML = todos.map(todo => createTodoHTML(todo)).join('');
}

// 개별 할일 HTML 생성
function createTodoHTML(todo) {
    const priorityColors = {
        high: 'bg-red-100 text-red-800',
        normal: 'bg-blue-100 text-blue-800',
        low: 'bg-gray-100 text-gray-800'
    };
    
    const priorityText = {
        high: '높음',
        normal: '보통',
        low: '낮음'
    };
    
    return `
        <div class="border rounded-lg p-4 ${todo.is_completed ? 'bg-gray-50' : 'bg-white'}">
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3 flex-1">
                    <!-- 체크박스 -->
                    <input 
                        type="checkbox" 
                        ${todo.is_completed ? 'checked' : ''}
                        onchange="toggleTodo('${todo.id}', ${!todo.is_completed})"
                        class="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer"
                    >
                    
                    <!-- 할일 내용 -->
                    <div class="flex-1">
                        <h3 class="font-semibold ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}">
                            ${todo.title}
                        </h3>
                        ${todo.description ? `
                            <p class="text-sm text-gray-600 mt-1">${todo.description}</p>
                        ` : ''}
                        <div class="flex items-center space-x-2 mt-2">
                            <span class="text-xs px-2 py-1 rounded ${priorityColors[todo.priority]}">
                                ${priorityText[todo.priority]}
                            </span>
                            <span class="text-xs text-gray-500">
                                ${new Date(todo.created_at).toLocaleDateString('ko-KR')}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- 삭제 버튼 -->
                <button 
                    onclick="deleteTodo('${todo.id}')"
                    class="text-red-500 hover:text-red-700 ml-4"
                >
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// 페이지 로드 시 할일 목록 불러오기
loadTodos();

// ========================================
// 할일 완료 상태 변경 (Update)
// ========================================

async function toggleTodo(id, isCompleted) {
    try {
        const { error } = await supabase
            .from('todos')
            .update({ is_completed: isCompleted })
            .eq('id', id);  // id가 일치하는 행만 업데이트
        
        if (error) throw error;
        
        console.log('✅ 할일 상태 변경 성공');
        loadTodos();  // 목록 새로고침
    } catch (error) {
        console.error('❌ 상태 변경 실패:', error.message);
        alert('상태 변경에 실패했습니다.');
    }
}

// ========================================
// 할일 삭제 (Delete)
// ========================================

async function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        console.log('✅ 할일 삭제 성공');
        loadTodos();  // 목록 새로고침
    } catch (error) {
        console.error('❌ 삭제 실패:', error.message);
        alert('삭제에 실패했습니다.');
    }
}

// app.js에 추가
supabase
    .channel('todos-changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
            console.log('실시간 변경 감지:', payload);
            loadTodos();
        }
    )
    .subscribe();

    async function loadTodosByPriority(priority) {
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('priority', priority)
        .order('created_at', { ascending: false });
    
    if (!error) displayTodos(data);
}

async function searchTodos(keyword) {
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .order('created_at', { ascending: false });
    
    if (!error) displayTodos(data);
}

// ========================================
// DOM 요소 가져오기 (인증 관련)
// ========================================

// 섹션
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');

// 탭 버튼
const loginTabBtn = document.getElementById('loginTabBtn');
const signupTabBtn = document.getElementById('signupTabBtn');

// 폼
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');

// 로그인 입력
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

// 회원가입 입력
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupPasswordConfirm = document.getElementById('signupPasswordConfirm');

// 로그아웃 버튼
const logoutBtn = document.getElementById('logoutBtn');

// 사용자 정보
const userEmailDisplay = document.getElementById('userEmail');

// ========================================
// 탭 전환 기능
// ========================================

loginTabBtn.addEventListener('click', () => {
    // 로그인 탭 활성화
    loginTabBtn.classList.add('bg-white', 'text-gray-800', 'shadow');
    loginTabBtn.classList.remove('text-gray-600');
    signupTabBtn.classList.remove('bg-white', 'text-gray-800', 'shadow');
    signupTabBtn.classList.add('text-gray-600');
    
    // 로그인 폼 표시
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
});

signupTabBtn.addEventListener('click', () => {
    // 회원가입 탭 활성화
    signupTabBtn.classList.add('bg-white', 'text-gray-800', 'shadow');
    signupTabBtn.classList.remove('text-gray-600');
    loginTabBtn.classList.remove('bg-white', 'text-gray-800', 'shadow');
    loginTabBtn.classList.add('text-gray-600');
    
    // 회원가입 폼 표시
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

// ========================================
// 회원가입 기능
// ========================================

signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const passwordConfirm = signupPasswordConfirm.value;
    
    // 비밀번호 확인
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 비밀번호 길이 확인
    if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        alert('회원가입 성공! 이메일 인증 링크를 확인해주세요.');
        console.log('✅ 회원가입 성공:', data);
        
        // 폼 초기화
        signupFormElement.reset();
        
        // 로그인 탭으로 전환
        loginTabBtn.click();
        
    } catch (error) {
        console.error('❌ 회원가입 실패:', error);
        alert(`회원가입 실패: ${error.message}`);
    }
});

// ========================================
// 로그인 기능
// ========================================

loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        console.log('✅ 로그인 성공:', data);
        
        // 로그인 폼 초기화
        loginFormElement.reset();
        
        // Todo 앱 화면으로 전환
        showApp();
        
        // 할일 목록 로드
        loadTodos();
        
    } catch (error) {
        console.error('❌ 로그인 실패:', error);
        alert(`로그인 실패: ${error.message}`);
    }
});

// ========================================
// 로그아웃 기능
// ========================================

logoutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        console.log('✅ 로그아웃 성공');
        
        // 로그인 화면으로 전환
        showAuth();
        
    } catch (error) {
        console.error('❌ 로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다.');
    }
});

// ========================================
// 화면 전환 함수
// ========================================

function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    
    // 사용자 이메일 표시
    supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
            userEmailDisplay.textContent = data.user.email;
        }
    });
}
// Google 로그인
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
        // OAuth 페이지로 리다이렉트됨
    } catch (error) {
        console.error('❌ Google 로그인 실패:', error);
        alert('Google 로그인에 실패했습니다.');
    }
});

