Spackage com.cafeteria.cafeteria_unifranz.Infraestructure.Persistence;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.cafeteria.cafeteria_unifranz.Domain.Usuario;
import com.cafeteria.cafeteria_unifranz.Domain.UsuarioRepository;

@Repository
public class UsuarioRepositoryAdapter implements UsuarioRepository {

    private final UsuarioJpaRepository jpaRepository;

    public UsuarioRepositoryAdapter(UsuarioJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<Usuario> findActiveByEmail(String email) {
        return jpaRepository.findByEmailIgnoreCaseAndEliminadoCuandoIsNull(email)
                .map(this::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmailIgnoreCase(email);
    }

    @Override
    public Usuario save(Usuario usuario) {
        UsuarioEntity entity = new UsuarioEntity(
                usuario.nombreCompleto(),
                usuario.email(),
                usuario.passwordHash(),
                usuario.rol()
        );

        UsuarioEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<Usuario> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Usuario> findById(Integer id) {
        return jpaRepository.findById(id)
                .map(this::toDomain);
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    private Usuario toDomain(UsuarioEntity entity) {
        return new Usuario(
                entity.getId(),
                entity.getNombreCompleto(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getRol());
    }
}
